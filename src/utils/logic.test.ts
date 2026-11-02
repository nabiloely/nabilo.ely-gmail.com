import test from 'node:test';
import assert from 'node:assert/strict';
import { formatArabicNumber, formatPercentage, toAsciiDigits, getSpiritualGreeting, getHijriDateDetails } from './arabicUtils';
import { incrementTasbeeh, decrementTasbeeh, calculateProgressPercentage, getSessionSummary } from './tasbeehLogic';
import {
  isTaskActiveOnDay,
  calculateDailyCompletionRate,
  shouldResetTasksForNewDay,
  resetTasksForNewDay,
  calculateWorshipStreak
} from './taskCalculations';
import { WorshipTask, TaskCompletion } from '../types';

test('formatArabicNumber converts digits to Eastern Arabic numerals correctly', () => {
  assert.equal(formatArabicNumber(33, true), '٣٣');
  assert.equal(formatArabicNumber(100, true), '١٠٠');
  assert.equal(formatArabicNumber(0, true), '٠');
  assert.equal(formatArabicNumber(1448, true), '١٤٤٨');
  assert.equal(formatArabicNumber(33, false), '33');
});

test('formatPercentage formats percentage cleanly with Arabic percentage sign', () => {
  assert.equal(formatPercentage(75, true), '٧٥٪');
  assert.equal(formatPercentage(0, true), '٠٪');
  assert.equal(formatPercentage(100, false), '100٪');
  assert.equal(toAsciiDigits('١٤٤٨'), '1448');
});

test('getHijriDateDetails computes accurate Umm al-Qura date', () => {
  const date = new Date('2026-11-02T12:00:00Z');
  const details = getHijriDateDetails(date);
  assert.equal(details.year, 1448);
  assert.equal(details.dayName, 'الإثنين');
  assert.match(details.formattedArabic, /١٤٤٨ هـ/);
});

test('getSpiritualGreeting returns appropriate Islamic greeting and subtext', () => {
  const morningDate = new Date('2026-11-02T08:00:00');
  const morning = getSpiritualGreeting(morningDate);
  assert.equal(morning.period, 'morning');
  assert.match(morning.greeting, /صباح مبارك/);

  const eveningDate = new Date('2026-11-02T18:00:00');
  const evening = getSpiritualGreeting(eveningDate);
  assert.equal(evening.period, 'evening');
  assert.match(evening.greeting, /مساء الخير/);
});

test('tasbeehLogic increments exactly by 1 and signals target reached', () => {
  const state = { count: 32, target: 33, sessionStartCount: 0, totalCycleCount: 0 };
  const result = incrementTasbeeh(state);
  assert.equal(result.newCount, 33);
  assert.equal(result.targetReached, true);
  assert.equal(result.isCycleCompleted, true);
  assert.equal(result.totalCycleCount, 1);

  const nextStep = incrementTasbeeh({ count: 33, target: 33, sessionStartCount: 0, totalCycleCount: 1 });
  assert.equal(nextStep.newCount, 34);
  assert.equal(nextStep.targetReached, false);
});

test('decrementTasbeeh does not decrement below zero', () => {
  assert.equal(decrementTasbeeh(10), 9);
  assert.equal(decrementTasbeeh(1), 0);
  assert.equal(decrementTasbeeh(0), 0);
});

test('calculateProgressPercentage returns accurate percentages', () => {
  assert.equal(calculateProgressPercentage(0, 33), 0);
  assert.equal(calculateProgressPercentage(33, 33), 100);
  assert.equal(calculateProgressPercentage(10, 100), 10);
  assert.equal(calculateProgressPercentage(50, 0), 0);
});

test('getSessionSummary computes count difference and pace', () => {
  const summary = getSessionSummary(0, 60, 0, 60000); // 60 dhikrs in 60 seconds
  assert.equal(summary.countDifference, 60);
  assert.equal(summary.durationSeconds, 60);
  assert.equal(summary.averagePacePerMinute, 60);
});

test('isTaskActiveOnDay checks recurrence rules accurately', () => {
  const dailyTask: WorshipTask = {
    id: '1',
    title: 'الفجر',
    category: 'prayer',
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    recurrence: 'daily',
    order: 1,
    createdAt: '2026-11-01'
  };
  assert.equal(isTaskActiveOnDay(dailyTask, 5), true); // Friday
  assert.equal(isTaskActiveOnDay(dailyTask, 0), true); // Sunday

  const fridayTask: WorshipTask = {
    ...dailyTask,
    title: 'قراءة سورة الكهف',
    recurrence: 'weekly',
    scheduledDays: [5] // Friday only
  };
  assert.equal(isTaskActiveOnDay(fridayTask, 5), true);
  assert.equal(isTaskActiveOnDay(fridayTask, 1), false);
});

test('calculateDailyCompletionRate calculates percentage correctly', () => {
  const tasks: WorshipTask[] = [
    { id: '1', title: '1', category: 'prayer', targetCount: 1, currentCount: 1, isCompleted: true, recurrence: 'daily', order: 1, createdAt: '' },
    { id: '2', title: '2', category: 'prayer', targetCount: 1, currentCount: 0, isCompleted: false, recurrence: 'daily', order: 2, createdAt: '' },
    { id: '3', title: '3', category: 'prayer', targetCount: 1, currentCount: 1, isCompleted: true, recurrence: 'daily', order: 3, createdAt: '' },
    { id: '4', title: '4', category: 'prayer', targetCount: 1, currentCount: 0, isCompleted: false, recurrence: 'daily', order: 4, createdAt: '' }
  ];
  assert.equal(calculateDailyCompletionRate(tasks), 50);
});

test('resetTasksForNewDay sets counts and completion to zero without deleting items', () => {
  const tasks: WorshipTask[] = [
    { id: '1', title: 'T1', category: 'prayer', targetCount: 1, currentCount: 1, isCompleted: true, recurrence: 'daily', order: 1, createdAt: '' }
  ];
  const reset = resetTasksForNewDay(tasks);
  assert.equal(reset[0].currentCount, 0);
  assert.equal(reset[0].isCompleted, false);
  assert.equal(reset[0].title, 'T1');
  assert.equal(shouldResetTasksForNewDay('2026-11-01', '2026-11-02'), true);
  assert.equal(shouldResetTasksForNewDay('2026-11-02', '2026-11-02'), false);
});

test('calculateWorshipStreak handles consecutive days properly', () => {
  const completions: TaskCompletion[] = [
    { id: 'c1', taskId: '1', taskTitle: 'الفجر', category: 'prayer', date: '2026-11-02', completedCount: 1, targetCount: 1, completedAt: '' },
    { id: 'c2', taskId: '1', taskTitle: 'الفجر', category: 'prayer', date: '2026-11-01', completedCount: 1, targetCount: 1, completedAt: '' },
    { id: 'c3', taskId: '1', taskTitle: 'الفجر', category: 'prayer', date: '2026-10-31', completedCount: 1, targetCount: 1, completedAt: '' },
    { id: 'c4', taskId: '1', taskTitle: 'الفجر', category: 'prayer', date: '2026-10-25', completedCount: 1, targetCount: 1, completedAt: '' }
  ];
  const result = calculateWorshipStreak(completions, '2026-11-02');
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 3);
});

test('quiet hours logic verifies time boundaries accurately', () => {
  function checkQuiet(currentMinutes: number, startStr: string, endStr: string): boolean {
    const [sH, sM] = startStr.split(':').map(Number);
    const [eH, eM] = endStr.split(':').map(Number);
    const startM = sH * 60 + sM;
    const endM = eH * 60 + eM;
    if (startM <= endM) {
      return currentMinutes >= startM && currentMinutes <= endM;
    } else {
      return currentMinutes >= startM || currentMinutes <= endM;
    }
  }

  // 23:00 (1380m) to 05:00 (300m)
  assert.equal(checkQuiet(23 * 60 + 30, '23:00', '05:00'), true); // 23:30 is quiet
  assert.equal(checkQuiet(2 * 60, '23:00', '05:00'), true);       // 02:00 is quiet
  assert.equal(checkQuiet(10 * 60, '23:00', '05:00'), false);     // 10:00 is NOT quiet
});
