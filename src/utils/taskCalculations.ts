import { WorshipTask, TaskCompletion } from '../types';

/**
 * Pure logic for worship task completion, streaks, and reset logic.
 */

export function isTaskActiveOnDay(task: WorshipTask, dayOfWeek: number): boolean {
  if (task.recurrence === 'daily') {
    return true;
  }
  if (task.recurrence === 'weekly' || task.recurrence === 'custom') {
    if (!task.scheduledDays || task.scheduledDays.length === 0) {
      return true;
    }
    return task.scheduledDays.includes(dayOfWeek);
  }
  return true;
}

export function filterActiveTasksForDate(tasks: WorshipTask[], date: Date): WorshipTask[] {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return tasks
    .filter(t => isTaskActiveOnDay(t, dayOfWeek))
    .sort((a, b) => a.order - b.order);
}

export function calculateDailyCompletionRate(tasks: WorshipTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.isCompleted).length;
  return Math.round((completed / tasks.length) * 100);
}

export function shouldResetTasksForNewDay(lastDateStr: string, currentDateStr: string): boolean {
  if (!lastDateStr) return false;
  return lastDateStr !== currentDateStr;
}

export function resetTasksForNewDay(tasks: WorshipTask[]): WorshipTask[] {
  return tasks.map(t => ({
    ...t,
    currentCount: 0,
    isCompleted: false
  }));
}

/**
 * Calculates current streak (consecutive days with completed tasks up to yesterday/today).
 */
export function calculateWorshipStreak(completions: TaskCompletion[], todayStr: string): {
  currentStreak: number;
  longestStreak: number;
  completedDaysSet: Set<string>;
} {
  // Extract unique dates with at least 1 completed task
  const completedDaysSet = new Set<string>();
  for (const c of completions) {
    if (c.date) {
      completedDaysSet.add(c.date);
    }
  }

  const sortedDays = Array.from(completedDaysSet).sort().reverse();
  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completedDaysSet };
  }

  let currentStreak = 0;
  const today = new Date(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If user completed tasks today, start from today; otherwise if yesterday was completed, start from yesterday
  let checkDate = new Date(today);
  if (!completedDaysSet.has(todayStr)) {
    if (completedDaysSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      return { currentStreak: 0, longestStreak: calculateLongestStreak(sortedDays), completedDaysSet };
    }
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (completedDaysSet.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(currentStreak, calculateLongestStreak(sortedDays));

  return {
    currentStreak,
    longestStreak,
    completedDaysSet
  };
}

function calculateLongestStreak(sortedDescDays: string[]): number {
  if (sortedDescDays.length === 0) return 0;
  // Sort ascending
  const asc = [...sortedDescDays].sort();
  let max = 1;
  let curr = 1;

  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const nextExpected = new Date(prev);
    nextExpected.setDate(nextExpected.getDate() + 1);
    const expectedStr = nextExpected.toISOString().split('T')[0];

    if (asc[i] === expectedStr) {
      curr++;
      if (curr > max) max = curr;
    } else {
      curr = 1;
    }
  }

  return max;
}
