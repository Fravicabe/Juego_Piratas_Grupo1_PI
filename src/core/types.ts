// Shared contract for the whole game. Changes require team review + PR.

export type ResourceId = "wood" | "iron" | "food" | "gold";

export interface ResourceAmount {
  id: ResourceId;
  amount: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface Ship {
  id: string;
  name: string;
  speed: number; // travel speed multiplier (higher = faster)
  cargo: number; // max cargo capacity
  hull: number;
  maxHull: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  bonus: { stat: string; value: number };
}

export interface Island {
  id: string;
  name: string;
  description: string;
  resources: ResourceId[]; // what can be gathered here
  travelTimeBase: number; // seconds from a reference point
  unlocked: boolean;
}

export interface Inventory {
  [key: string]: number; // ResourceId -> amount
}

export interface Player {
  name: string;
  rank: string;
  gold: number;
}

export interface GameState {
  version: number;
  player: Player;
  ship: Ship;
  crew: CrewMember[];
  skills: Record<string, Skill>;
  islands: Record<string, Island>;
  discoveredIslands: string[];
  currentIslandId: string | null;
  destinationIslandId: string | null;
  travelEta: number; // seconds remaining
  inventory: Inventory;
  lastTick: number; // epoch ms
  totalPlaytime: number; // seconds
}

export type GameAction =
  | { type: "SET_DESTINATION"; islandId: string }
  | { type: "ARRIVE" }
  | { type: "GATHER_TICK"; dt: number }
  | { type: "LOAD"; state: GameState }
  | { type: "RESET" };

export const SCHEMA_VERSION = 1;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60; // 8 hours
