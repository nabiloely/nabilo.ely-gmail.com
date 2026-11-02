import { ReminderItem, UserSettings } from '../types';
import { storage } from './storage';
import { sensory } from './audioAndSensory';

export interface InAppToast {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: number;
}

export class NotificationService {
  private listeners: ((toast: InAppToast) => void)[] = [];
  private checkInterval: any = null;

  public subscribe(cb: (toast: InAppToast) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  /**
   * Checks if current time falls within user's quiet hours
   */
  public isInsideQuietHours(quietHours: UserSettings['quietHours']): boolean {
    if (!quietHours.enabled || !quietHours.start || !quietHours.end) {
      return false;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = quietHours.start.split(':').map(Number);
    const [endH, endM] = quietHours.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Spans midnight, e.g. 23:00 to 05:00
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  /**
   * Dispatches a notification via Web Notification API (if allowed) + in-app alert banner
   */
  public triggerNotification(title: string, body: string, reminderId?: string) {
    const settings = storage.getSettings();
    if (settings.globalNotificationsMute) {
      return;
    }

    if (this.isInsideQuietHours(settings.quietHours)) {
      return;
    }

    const toast: InAppToast = {
      id: 'toast-' + Date.now(),
      title,
      message: body,
      type: 'reminder',
      timestamp: Date.now()
    };

    // Play subtle audio and vibration
    sensory.playTapSound(settings.soundEnabled);
    sensory.vibrate([40, 60, 40], settings.vibrationEnabled);

    // Broadcast in-app
    this.listeners.forEach(cb => cb(toast));

    // Save to history log
    storage.addNotificationLog({
      id: toast.id,
      title: `${title}: ${body}`,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    });

    // Try system notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          dir: 'rtl',
          lang: 'ar'
        });
      } catch {
        // Notification constructor might fail in certain iframe sandboxes
      }
    }
  }

  /**
   * Periodic checker to evaluate if any reminder needs to fire
   */
  public startReminderScheduler() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.evaluateReminders();
    }, 30000); // Check every 30 seconds
  }

  public stopReminderScheduler() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public evaluateReminders() {
    const reminders = storage.getReminders();
    const settings = storage.getSettings();
    if (settings.globalNotificationsMute) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentH = String(now.getHours()).padStart(2, '0');
    const currentM = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;
    const todayDateStr = now.toISOString().split('T')[0];

    reminders.forEach(rem => {
      if (!rem.enabled) return;
      if (!rem.days.includes(currentDay)) return;

      // Avoid firing multiple times within same minute or same day
      const lastTriggerDateKey = `${rem.id}_${todayDateStr}_${currentTimeStr}`;
      const hasTriggeredRecently = sessionStorage.getItem(lastTriggerDateKey);

      if (rem.time === currentTimeStr && !hasTriggeredRecently) {
        sessionStorage.setItem(lastTriggerDateKey, 'true');
        this.triggerNotification(
          rem.title,
          rem.subtitle || 'حان موعد وردك المبارك، بارك الله في أوقاتك وأعمالك',
          rem.id
        );
      }
    });
  }
}

export const notificationService = new NotificationService();
