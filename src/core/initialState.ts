import islandsJson from "../data/islands.json";
import type { GameState, Island, ResourceId, Skill } from "./types";
import { SCHEMA_VERSION } from "./types";

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

function createSkills(): Record<string, Skill> {
  return {
    sailing: {
      id: "sailing",
      name: "Sailing",
      level: 1,
      xp: 0,
      xpToNext: 100,
    },
    gathering: {
      id: "gathering",
      name: "Gathering",
      level: 1,
      xp: 0,
      xpToNext: 100,
    },
  };
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
    islands: createIslands(),
    discoveredIslands: [STARTING_ISLAND_ID],
    currentIslandId: STARTING_ISLAND_ID,
    destinationIslandId: null,
    travelEta: 0,
    inventory: { wood: 0, iron: 0, food: 0, gold: 0 },
    lastTick: now,
    totalPlaytime: 0,
  };
}
