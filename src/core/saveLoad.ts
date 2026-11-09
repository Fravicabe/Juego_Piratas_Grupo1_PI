import type {
  GameState,
  Inventory,
  Island,
  Player,
  ResourceId,
  Ship,
} from "./types";
import { SCHEMA_VERSION, WORLD_TICK_MS } from "./types";
import { createInitialState } from "./initialState";
import { DEFAULT_ACTIVE_SKILL_ID, normalizeSkills } from "./skills";

export const SAVE_KEY = "pirate-idle-save";

const SUPPORTED_VERSIONS = [1, SCHEMA_VERSION];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsland(value: unknown): value is Island {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.resources) &&
    value.resources.every((resource) => typeof resource === "string") &&
    typeof value.travelTimeBase === "number" &&
    Number.isFinite(value.travelTimeBase) &&
    typeof value.unlocked === "boolean"
  );
}

function normalizeIslands(
  saved: Record<string, Island> | undefined,
  fallback: Record<string, Island>,
): Record<string, Island> {
  const islands: Record<string, Island> = { ...fallback };

  for (const [id, island] of Object.entries(saved ?? {})) {
    if (isIsland(island)) {
      islands[id] = island;
    }
  }

  return islands;
}

function normalizeInventory(
  saved: Partial<Inventory> | undefined,
  fallback: Inventory,
): Inventory {
  const inventory: Inventory = { ...fallback };

  for (const id of Object.keys(inventory) as ResourceId[]) {
    const value = Number(saved?.[id]);
    inventory[id] = Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  return inventory;
}

/**
 * Converts v1 saves (no active skill, no world accumulator, old XP curve) and
 * revalidates v2 saves against the current skill definitions.
 */
function normalizeSave(save: Partial<GameState>): GameState {
  const fresh = createInitialState();
  const skills = normalizeSkills(save.skills);
  const islands = normalizeIslands(save.islands, fresh.islands);

  const requestedSkill =
    typeof save.activeSkillId === "string" ? save.activeSkillId : null;
  const fallbackSkillId = skills[DEFAULT_ACTIVE_SKILL_ID]
    ? DEFAULT_ACTIVE_SKILL_ID
    : (Object.keys(skills)[0] ?? null);
  const activeSkillId =
    requestedSkill && skills[requestedSkill]
      ? requestedSkill
      : fallbackSkillId;

  const currentIslandId =
    typeof save.currentIslandId === "string" && islands[save.currentIslandId]
      ? save.currentIslandId
      : fresh.currentIslandId;

  const savedDiscoveries = Array.isArray(save.discoveredIslands)
    ? save.discoveredIslands.filter(
        (id): id is string => typeof id === "string" && Boolean(islands[id]),
      )
    : [];

  const discoveredIslands =
    savedDiscoveries.length > 0
      ? [...new Set(savedDiscoveries)]
      : [...fresh.discoveredIslands];

  if (currentIslandId && !discoveredIslands.includes(currentIslandId)) {
    discoveredIslands.push(currentIslandId);
  }

  const destinationIslandId =
    typeof save.destinationIslandId === "string" &&
    islands[save.destinationIslandId] &&
    save.destinationIslandId !== currentIslandId
      ? save.destinationIslandId
      : null;

  const rawAccumulator = Number(save.worldAccumulatorMs);
  const worldAccumulatorMs = Number.isFinite(rawAccumulator)
    ? Math.max(0, rawAccumulator) % WORLD_TICK_MS
    : 0;

  return {
    ...fresh,
    version: SCHEMA_VERSION,
    player: {
      ...fresh.player,
      ...(isRecord(save.player) ? (save.player as Partial<Player>) : {}),
    },
    ship: {
      ...fresh.ship,
      ...(isRecord(save.ship) ? (save.ship as Partial<Ship>) : {}),
    },
    crew: Array.isArray(save.crew) ? save.crew : fresh.crew,
    skills,
    activeSkillId,
    islands,
    discoveredIslands,
    currentIslandId,
    destinationIslandId,
    travelEta: destinationIslandId
      ? Math.max(0, Number(save.travelEta) || 0)
      : 0,
    inventory: normalizeInventory(save.inventory, fresh.inventory),
    lastTick: Number.isFinite(save.lastTick)
      ? Number(save.lastTick)
      : Date.now(),
    worldAccumulatorMs,
    totalPlaytime: Math.max(0, Number(save.totalPlaytime) || 0),
  };
}

export function saveGame(state: GameState): void {
  try {
    const payload = JSON.stringify({ ...state, version: SCHEMA_VERSION });
    localStorage.setItem(SAVE_KEY, payload);
  } catch {
    // Storage can be unavailable or full; ignore so the game keeps running.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const save = parsed as Partial<GameState>;
    if (!SUPPORTED_VERSIONS.includes(Number(save.version))) return null;
    if (!isRecord(save.player) || !isRecord(save.ship)) return null;
    if (!isRecord(save.inventory)) return null;
    if (!isRecord(save.skills) || Object.keys(save.skills).length === 0) {
      return null;
    }
    if (!isRecord(save.islands) || Object.keys(save.islands).length === 0) {
      return null;
    }

    return normalizeSave(save);
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Storage can be unavailable; there is nothing to clear.
  }
}
