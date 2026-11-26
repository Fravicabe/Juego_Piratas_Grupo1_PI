// Shared contract for the whole game. Changes require team review.

export type ResourceId = "wood" | "iron" | "food" | "gold";

export interface ResourceAmount {
  id: ResourceId;
  amount: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  baseXp: number;
  xpPerSecond: number; // XP/s while this skill is the active one
  effectPerLevel: number; // 0.05 = +5% of the effect per level
  effectLabel: string; // what the effect improves, for the UI
}

export interface Skill extends SkillDefinition {
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
  travelTimeBase: number; // seconds from the reference island (Tortuga)
  unlocked: boolean;
  lockedUntilLevel?: number; // sailing level required to unlock
  unlockCost?: Partial<Record<ResourceId, number>>; // resources needed to unlock the island
  requiresIslandId?: string; // previous island that must be unlocked first
}

// Gold is a resource too, so the inventory is the single source of truth.
export type Inventory = Record<ResourceId, number>;

export interface Player {
  name: string;
  rank: string;
}

export interface GameState {
  version: number;
  player: Player;
  ship: Ship;
  crew: CrewMember[];
  skills: Record<string, Skill>;
  activeSkillId: string | null; // skill trained by the fast tick
  islands: Record<string, Island>;
  discoveredIslands: string[];
  currentIslandId: string | null;
  destinationIslandId: string | null;
  travelEta: number; // seconds remaining
  inventory: Inventory;
  lastTick: number; // epoch ms
  worldAccumulatorMs: number; // leftover time for the next 1s world tick
  totalPlaytime: number; // seconds
}

export const SCHEMA_VERSION = 3;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60; // 8 hours

/**
 * Fast simulation tick for skill progress. Progress Knight uses 50ms
 * (20 updates/s). 10ms would mean 100 store updates/s and 1ms 1000/s;
 * React only paints at ~60fps, so the extra work is not visible.
 */
export const SKILL_TICK_MS = 50;
export const LOOP_TICK_MS = SKILL_TICK_MS;

/** Travel, arrival and gathering stay on a 1 second tick. */
export const WORLD_TICK_MS = 1000;

export const AUTOSAVE_MS = 10_000;
