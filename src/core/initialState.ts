import islandsJson from "../data/islands.json";
import type { GameState, Island, ResourceId } from "./types";
import { SCHEMA_VERSION } from "./types";
import { createSkills, DEFAULT_ACTIVE_SKILL_ID } from "./skills";

export const STARTING_ISLAND_ID = "tortuga";

const BASE_ISLANDS: Record<string, Island> = {};

for (const island of islandsJson) {
  BASE_ISLANDS[island.id] = {
    ...island,
    resources: island.resources as ResourceId[],
  };
}

function createIslands(): Record<string, Island> {
  const islands: Record<string, Island> = {};

  for (const [id, island] of Object.entries(BASE_ISLANDS)) {
    islands[id] = { ...island, resources: [...island.resources] };
  }

  return islands;
}

/**
 * Builds a fresh game state. Passing `now` keeps tests deterministic.
 */
export function createInitialState(now = Date.now()): GameState {
  return {
    version: SCHEMA_VERSION,
    player: { name: "Captain", rank: "Cabin Boy" },
    ship: {
      id: "starter",
      name: "The Minnow",
      speed: 1,
      cargo: 50,
      hull: 100,
      maxHull: 100,
    },
    crew: [],
    skills: createSkills(),
    activeSkillId: DEFAULT_ACTIVE_SKILL_ID,
    islands: createIslands(),
    discoveredIslands: [STARTING_ISLAND_ID],
    currentIslandId: STARTING_ISLAND_ID,
    destinationIslandId: null,
    travelEta: 0,
    inventory: { wood: 0, iron: 0, food: 0, gold: 0 },
    lastTick: now,
    worldAccumulatorMs: 0,
    totalPlaytime: 0,
  };
}
