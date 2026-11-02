// Pure tick logic. Kept side-effect free so it is easy to test.

import type { GameState, Skill } from "./types";
import { OFFLINE_CAP_SECONDS } from "./types";

export const GATHER_BASE_RATE = 1;
export const GATHER_RATE_PER_LEVEL = 0.25;
export const GATHER_XP_PER_SECOND = 10;
export const SAILING_XP_PER_SECOND = 2;
export const XP_BASE = 100;
export const XP_GROWTH = 1.5;
export const OFFLINE_STEP_SECONDS = 60;

export function accumulateTicks(
  lastTick: number,
  now: number,
  capSeconds: number,
): { elapsedSeconds: number; newLastTick: number } {
  const raw = Math.max(0, (now - lastTick) / 1000);
  const elapsed = Math.min(raw, capSeconds);
  return { elapsedSeconds: elapsed, newLastTick: now };
}

export function xpForLevel(level: number): number {
  return Math.floor(XP_BASE * Math.pow(XP_GROWTH, Math.max(0, level - 1)));
}

export function applyXp(skill: Skill, amount: number): Skill {
  let level = Math.max(1, skill.level);
  let xp = Math.max(0, skill.xp) + Math.max(0, amount);
  let xpToNext = skill.xpToNext > 0 ? skill.xpToNext : xpForLevel(level);
  let guard = 0;

  while (xp >= xpToNext && guard < 1000) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level);
    guard += 1;
  }

  return { ...skill, level, xp, xpToNext };
}

export function gatherRate(level: number): number {
  return GATHER_BASE_RATE + Math.max(0, level - 1) * GATHER_RATE_PER_LEVEL;
}

export function arriveAtDestination(state: GameState): GameState {
  const arrivedId = state.destinationIslandId;
  if (!arrivedId) return state;

  return {
    ...state,
    currentIslandId: arrivedId,
    destinationIslandId: null,
    travelEta: 0,
    discoveredIslands: state.discoveredIslands.includes(arrivedId)
      ? state.discoveredIslands
      : [...state.discoveredIslands, arrivedId],
  };
}

export function travelFor(
  state: GameState,
  dtSeconds: number,
): { state: GameState; remainingSeconds: number } {
  const dt = Math.max(0, dtSeconds);
  if (!state.destinationIslandId || dt === 0) {
    return { state, remainingSeconds: dt };
  }

  const eta = Math.max(0, state.travelEta);
  const travelSeconds = Math.min(eta, dt);
  let next: GameState = {
    ...state,
    travelEta: eta - travelSeconds,
  };

  const sailing = next.skills.sailing;
  if (sailing && travelSeconds > 0) {
    next = {
      ...next,
      skills: {
        ...next.skills,
        sailing: applyXp(sailing, travelSeconds * SAILING_XP_PER_SECOND),
      },
    };
  }

  if (next.travelEta <= 0) {
    next = arriveAtDestination(next);
  }

  return { state: next, remainingSeconds: dt - travelSeconds };
}

export function gatherFor(state: GameState, dtSeconds: number): GameState {
  const dt = Math.max(0, dtSeconds);
  if (dt === 0 || !state.currentIslandId || state.destinationIslandId) {
    return state;
  }

  const island = state.islands[state.currentIslandId];
  const gathering = state.skills.gathering;
  if (!island || !gathering) return state;

  const rate = gatherRate(gathering.level);
  const inventory = { ...state.inventory };

  for (const resource of island.resources) {
    inventory[resource] = (inventory[resource] ?? 0) + rate * dt;
  }

  return {
    ...state,
    inventory,
    skills: {
      ...state.skills,
      gathering: applyXp(gathering, dt * GATHER_XP_PER_SECOND),
    },
  };
}

export function applyTick(state: GameState, dtSeconds: number): GameState {
  const dt = Math.max(0, dtSeconds);
  if (dt === 0) return state;

  const travelled = travelFor(state, dt);
  const gathered = gatherFor(travelled.state, travelled.remainingSeconds);

  return {
    ...gathered,
    totalPlaytime: state.totalPlaytime + dt,
  };
}

/**
 * Applies a long span of time in small steps so level-ups affect the rate
 * during offline catch-up.
 */
export function applyElapsed(state: GameState, seconds: number): GameState {
  let remaining = Math.max(0, seconds);
  let next = state;

  while (remaining > 0) {
    const step = Math.min(remaining, OFFLINE_STEP_SECONDS);
    next = applyTick(next, step);
    remaining -= step;
  }

  return next;
}

export function applyOfflineProgress(
  state: GameState,
  now: number,
  capSeconds = OFFLINE_CAP_SECONDS,
): GameState {
  const { elapsedSeconds } = accumulateTicks(state.lastTick, now, capSeconds);
  return { ...applyElapsed(state, elapsedSeconds), lastTick: now };
}
