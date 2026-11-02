/**
 * Unified Audio Playback Engine for Adhkar
 * Supports:
 * 1. Full Continuous Audio Track for the whole category (from authentic CDN like Hisn al-Muslim)
 * 2. Sequential Playlist track-by-track recitation with auto-advancing
 * 3. Graceful Arabic TTS Speech Synthesis fallback if offline
 * 4. Real-time state tracking: playing, paused, loading, time progress, playback speed, and active track
 */

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type PlaybackMode = 'full_track' | 'sequential';

export interface PlaylistItem {
  id: string;
  text: string;
  audioUrl?: string;
  reciter?: string;
}

export interface AudioPlayerState {
  activeEntryId: string | null;
  status: AudioStatus;
  playbackMode: PlaybackMode;
  categoryKey?: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  reciter?: string;
  sourceType: 'cdn' | 'tts';
  playlistTitle?: string;
  currentIndex: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  error?: string;
}

class AdhkarAudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((state: AudioPlayerState) => void)[] = [];

  private playlist: PlaylistItem[] = [];
  private currentIndex: number = 0;
  private playlistTitle: string = '';
  private currentMode: PlaybackMode = 'full_track';
  private currentCategoryKey: string = '';

  private state: AudioPlayerState = {
    activeEntryId: null,
    status: 'idle',
    playbackMode: 'full_track',
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    sourceType: 'cdn',
    currentIndex: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn({ ...this.state }));
  }

  public subscribe(listener: (state: AudioPlayerState) => void) {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): AudioPlayerState {
    return { ...this.state };
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.state.status = 'playing';
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      if (this.state.status === 'playing') {
        this.state.status = 'paused';
        this.notify();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.state.currentTime = this.audio.currentTime;
        this.state.duration = this.audio.duration || 0;
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.currentMode === 'sequential' && this.currentIndex < this.playlist.length - 1) {
        this.next();
      } else {
        this.stop();
      }
    });

    this.audio.addEventListener('error', () => {
      if (this.currentMode === 'sequential' && this.playlist[this.currentIndex]) {
        this.playWithSpeechSynthesis(this.playlist[this.currentIndex].text);
      } else {
        this.state.status = 'error';
        this.state.error = 'تعذر تحميل الملف الصوتي، يرجى التحقق من الاتصال';
        this.notify();
      }
    });
  }

  /**
   * Play the continuous full-recitation audio track for an entire category
   */
  public playCategoryFullAudio(categoryKey: string, audioUrl: string, title: string, reciter: string) {
    // If already playing this category, toggle play/pause
    if (this.state.categoryKey === categoryKey && this.currentMode === 'full_track') {
      if (this.state.status === 'playing') {
        this.pause();
        return;
      } else if (this.state.status === 'paused') {
        this.resume();
        return;
      }
    }

    this.stopCurrentMedia();

    this.currentMode = 'full_track';
    this.currentCategoryKey = categoryKey;
    this.playlistTitle = title;

    this.state.playbackMode = 'full_track';
    this.state.categoryKey = categoryKey;
    this.state.playlistTitle = title;
    this.state.reciter = reciter;
    this.state.activeEntryId = null;
    this.state.currentIndex = 0;
    this.state.totalItems = 1;
    this.state.hasNext = false;
    this.state.hasPrev = false;
    this.state.currentTime = 0;
    this.state.duration = 0;
    this.state.status = 'loading';
    this.state.sourceType = 'cdn';
    this.state.error = undefined;
    this.notify();

    if (this.audio) {
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.state.playbackRate;
      this.audio.load();

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.state.status = 'playing';
            this.notify();
          })
          .catch(() => {
            this.state.status = 'error';
            this.state.error = 'تعذر بدء التشغيل التلقائي، اضغط زر التشغيل';
            this.notify();
          });
      }
    }
  }

  /**
   * Play full collection sequentially item-by-item
   */
  public playPlaylist(items: PlaylistItem[], startIndex: number = 0, title: string = 'الأذكار كاملة', categoryKey: string = '') {
    if (items.length === 0) return;

    this.stopCurrentMedia();

    this.currentMode = 'sequential';
    this.currentCategoryKey = categoryKey;
    this.playlist = items;
    this.playlistTitle = title;
    this.currentIndex = Math.max(0, Math.min(startIndex, items.length - 1));

    this.state.playbackMode = 'sequential';
    this.state.categoryKey = categoryKey;
    this.state.playlistTitle = title;
    this.state.error = undefined;

    this.playCurrentItem();
  }

  private playCurrentItem() {
    const item = this.playlist[this.currentIndex];
    if (!item) return;

    this.state.activeEntryId = item.id;
    this.state.currentIndex = this.currentIndex;
    this.state.totalItems = this.playlist.length;
    this.state.hasNext = this.currentIndex < this.playlist.length - 1;
    this.state.hasPrev = this.currentIndex > 0;
    this.state.reciter = item.reciter;
    this.state.currentTime = 0;
    this.state.duration = 0;

    if (item.audioUrl && this.audio) {
      this.state.status = 'loading';
      this.state.sourceType = 'cdn';
      this.notify();

      this.audio.src = item.audioUrl;
      this.audio.playbackRate = this.state.playbackRate;
      this.audio.load();

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.state.status = 'playing';
            this.notify();
          })
          .catch(() => {
            this.playWithSpeechSynthesis(item.text);
          });
      }
    } else {
      this.playWithSpeechSynthesis(item.text);
    }
  }

  private playWithSpeechSynthesis(rawText: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.state.status = 'error';
      this.state.error = 'الصوت غير مدعوم في هذا المتصفح';
      this.notify();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = rawText
        .replace(/﴿|﴾|\[.*?\]|«|»|۞|۝/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.88 * this.state.playbackRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.state.status = 'playing';
        this.state.sourceType = 'tts';
        this.state.reciter = 'قارئ النصوص الذكي (عربي)';
        this.notify();
      };

      utterance.onend = () => {
        if (this.currentMode === 'sequential' && this.currentIndex < this.playlist.length - 1) {
          this.next();
        } else {
          this.stop();
        }
      };

      utterance.onerror = () => {
        if (this.currentMode === 'sequential' && this.currentIndex < this.playlist.length - 1) {
          this.next();
        } else {
          this.stop();
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.stop();
    }
  }

  public next() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.stopCurrentMedia();
      this.playCurrentItem();
    }
  }

  public prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.stopCurrentMedia();
      this.playCurrentItem();
    }
  }

  public pause() {
    if (this.state.sourceType === 'cdn' && this.audio) {
      this.audio.pause();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.state.status = 'paused';
    this.notify();
  }

  public resume() {
    if (this.state.sourceType === 'cdn' && this.audio) {
      this.audio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    this.state.status = 'playing';
    this.notify();
  }

  private stopCurrentMedia() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public stop() {
    this.stopCurrentMedia();
    this.state.status = 'idle';
    this.state.activeEntryId = null;
    this.state.currentTime = 0;
    this.state.duration = 0;
    this.notify();
  }

  public seek(seconds: number) {
    if (this.state.sourceType === 'cdn' && this.audio) {
      this.audio.currentTime = seconds;
      this.state.currentTime = seconds;
      this.notify();
    }
  }

  public setPlaybackRate(rate: number) {
    this.state.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.notify();
  }
}

export const adhkarAudio = new AdhkarAudioManager();
