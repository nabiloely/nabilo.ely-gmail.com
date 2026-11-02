/**
 * Pure logic functions for Smart Tasbeeh calculations and state transformations.
 */

export interface TasbeehState {
  count: number;
  target: number; // 0 means free count (no limit)
  sessionStartCount: number;
  totalCycleCount: number;
}

export function incrementTasbeeh(state: TasbeehState): {
  newCount: number;
  targetReached: boolean;
  isCycleCompleted: boolean;
  totalCycleCount: number;
} {
  const nextCount = state.count + 1;
  const hasTarget = state.target > 0;
  const targetReached = hasTarget && nextCount === state.target;
  const isCycleCompleted = hasTarget && nextCount % state.target === 0;
  const totalCycleCount = hasTarget ? Math.floor(nextCount / state.target) : 0;

  return {
    newCount: nextCount,
    targetReached,
    isCycleCompleted,
    totalCycleCount
  };
}

export function decrementTasbeeh(currentCount: number): number {
  return Math.max(0, currentCount - 1);
}

export function calculateProgressPercentage(count: number, target: number): number {
  if (target <= 0) return 0;
  // If count exceeds target, show progress within current cycle or 100%
  const currentInCycle = count % target;
  if (count > 0 && currentInCycle === 0) return 100;
  return Math.min(100, Math.round((currentInCycle / target) * 100));
}

export function getSessionSummary(
  startCount: number,
  finalCount: number,
  startTimeMs: number,
  endTimeMs: number = Date.now()
): {
  countDifference: number;
  durationSeconds: number;
  averagePacePerMinute: number;
} {
  const countDifference = Math.max(0, finalCount - startCount);
  const durationSeconds = Math.max(1, Math.round((endTimeMs - startTimeMs) / 1000));
  const averagePacePerMinute = Math.round((countDifference / (durationSeconds / 60)) * 10) / 10;

  return {
    countDifference,
    durationSeconds,
    averagePacePerMinute
  };
}
