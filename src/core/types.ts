// Shared contract for the whole game. Changes require team review.

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
  baseXp?: number;
  effectPerLevel?: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  baseXp?: number;
  effectPerLevel?: number;
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
  lockedUntilLevel?: number; // nivel de navegación requerido para desbloquear
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
  islands: Record<string, Island>;
  discoveredIslands: string[];
  currentIslandId: string | null;
  destinationIslandId: string | null;
  travelEta: number; // seconds remaining
  inventory: Inventory;
  lastTick: number; // epoch ms
  totalPlaytime: number; // seconds
}

export const SCHEMA_VERSION = 1;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60; // 8 hours
export const TICK_MS = 1000;
export const AUTOSAVE_MS = 10_000;
