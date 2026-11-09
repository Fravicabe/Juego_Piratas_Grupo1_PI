export interface SailableIsland {
  id: string;
  unlocked: boolean;
  lockedUntilLevel?: number;
}

/**
 * Formats a remaining time in seconds as "mm:ss".
 */
export function formatEta(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

/**
 * A trip can only start when the island is unlocked, discovered,
 * not the current island, no trip is in progress, and the player
 * meets the level requirement if any.
 */
export function canSailTo(
  island: SailableIsland,
  currentId: string | null,
  isTraveling: boolean,
  discovered: boolean,
  sailingLevel: number,
): boolean {
  if (!island.unlocked) return false;
  if (island.lockedUntilLevel && sailingLevel < island.lockedUntilLevel) return false;
  if (island.id === currentId) return false;
  if (isTraveling) return false;
  if (!discovered) return false;
  return true;
}
