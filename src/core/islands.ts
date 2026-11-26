import type { GameState, ResourceId } from "./types";

export interface MissingResource {
  id: ResourceId;
  required: number;
  missing: number;
}

export interface IslandUnlockStatus {
  islandId: string;
  unlocked: boolean;
  hasCost: boolean;
  requiresIslandId: string | null;
  previousIslandUnlocked: boolean;
  levelRequired: number | null;
  levelRequirementMet: boolean;
  missingResources: MissingResource[];
  canUnlock: boolean;
}

type UnlockState = Pick<GameState, "islands" | "inventory" | "skills">;

const EMPTY_STATUS: Omit<IslandUnlockStatus, "islandId"> = {
  unlocked: false,
  hasCost: false,
  requiresIslandId: null,
  previousIslandUnlocked: false,
  levelRequired: null,
  levelRequirementMet: false,
  missingResources: [],
  canUnlock: false,
};

/**
 * Returns everything the map needs to explain why an island can or cannot be
 * unlocked. Keeping the rules pure avoids the UI and the store drifting apart.
 */
export function getIslandUnlockStatus(
  state: UnlockState,
  islandId: string,
): IslandUnlockStatus {
  const island = state.islands[islandId];
  if (!island) {
    return { islandId, ...EMPTY_STATUS };
  }

  const cost = Object.entries(island.unlockCost ?? {}) as Array<
    [ResourceId, number]
  >;
  const missingResources = cost
    .map(([id, required]) => ({
      id,
      required,
      missing: Math.max(0, required - (state.inventory[id] ?? 0)),
    }))
    .filter((resource) => resource.missing > 0);

  const requiresIslandId = island.requiresIslandId ?? null;
  const previousIslandUnlocked =
    !requiresIslandId || Boolean(state.islands[requiresIslandId]?.unlocked);

  const levelRequired = island.lockedUntilLevel ?? null;
  const sailingLevel = state.skills.sailing?.level ?? 1;
  const levelRequirementMet = !levelRequired || sailingLevel >= levelRequired;

  const hasCost = cost.length > 0;

  return {
    islandId,
    unlocked: island.unlocked,
    hasCost,
    requiresIslandId,
    previousIslandUnlocked,
    levelRequired,
    levelRequirementMet,
    missingResources,
    canUnlock:
      !island.unlocked &&
      hasCost &&
      previousIslandUnlocked &&
      levelRequirementMet &&
      missingResources.length === 0,
  };
}
