// Pure tick logic. Kept side-effect free for testing.

export function accumulateTicks(
  lastTick: number,
  now: number,
  capSeconds: number,
): { elapsedSeconds: number; newLastTick: number } {
  const raw = Math.max(0, (now - lastTick) / 1000);
  const elapsed = Math.min(raw, capSeconds);
  return { elapsedSeconds: elapsed, newLastTick: now };
}

export function advanceState<T extends { lastTick: number; totalPlaytime: number }>(
  state: T,
  elapsedSeconds: number,
): T {
  return { ...state, totalPlaytime: state.totalPlaytime + elapsedSeconds };
}
