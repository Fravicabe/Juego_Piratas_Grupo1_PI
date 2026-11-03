// Pure tick logic. Kept side-effect free so it is easy to test.

import type { GameState, Skill } from "./types";
import { OFFLINE_CAP_SECONDS, WORLD_TICK_MS } from "./types";
import { applyXp, skillEffect } from "./skills";

export {
  applyXp,
  skillEffect,
  xpForLevel,
  XP_BASE,
  XP_LEVEL_GROWTH,
} from "./skills";

export const GATHER_BASE_RATE = 1;
export const GATHER_XP_PER_SECOND = 8;
export const SAILING_XP_PER_SECOND = 1;
export const BARGAINING_XP_PER_SECOND = 1;

/** Longest slice used when applying offline time, so level-ups are felt. */
export const OFFLINE_STEP_SECONDS = 60;

function safeDelta(seconds: number): number {
  return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
}

export function accumulateTicks(
  lastTick: number,
  now: number,
  capSeconds: number,
): { elapsedSeconds: number; newLastTick: number } {
  const raw =
    Number.isFinite(lastTick) && Number.isFinite(now)
      ? Math.max(0, (now - lastTick) / 1000)
      : 0;
  const elapsed = Math.min(raw, capSeconds);
  return { elapsedSeconds: elapsed, newLastTick: now };
}

/**
 * Resource yield per second for a gathering level. Level 1 gives 1/s and each
 * level adds `effectPerLevel` (5% by default).
 */
export function gatherRate(level: number, effectPerLevel = 0.05): number {
  const safeLevel = Math.max(1, Number(level) || 1);
  const perLevel = Number.isFinite(effectPerLevel) ? effectPerLevel : 0.05;
  return GATHER_BASE_RATE * (1 + Math.max(0, safeLevel - 1) * perLevel);
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

/**
 * Advances travel by `dtSeconds` of real time. The sailing skill makes the
 * ship cover more ETA per second, and earns XP for the real time spent sailing.
 */
export function travelFor(
  state: GameState,
  dtSeconds: number,
): { state: GameState; remainingSeconds: number } {
  const dt = safeDelta(dtSeconds);
  if (!state.destinationIslandId || dt === 0) {
    return { state, remainingSeconds: dt };
  }

  const sailing = state.skills.sailing;
  const speedMultiplier = Math.max(
    0.1,
    sailing ? skillEffect(sailing) : 1,
  );
  const eta = Math.max(0, state.travelEta);
  const travelSeconds = Math.min(eta, dt * speedMultiplier);
  const realTravelSeconds =
    speedMultiplier > 0 ? travelSeconds / speedMultiplier : travelSeconds;

  let next: GameState = {
    ...state,
    travelEta: Math.max(0, eta - travelSeconds),
  };

  if (sailing && realTravelSeconds > 0) {
    next = {
      ...next,
      skills: {
        ...next.skills,
        sailing: applyXp(
          sailing,
          realTravelSeconds * SAILING_XP_PER_SECOND,
        ),
      },
    };
  }

  if (next.travelEta <= 0.000001) {
    next = arriveAtDestination(next);
  }

  return {
    state: next,
    remainingSeconds: Math.max(0, dt - realTravelSeconds),
  };
}

/**
 * Gives resources and activity XP. Bargaining only multiplies gold and only
 * earns XP on islands that actually produce gold.
 */
export function gatherFor(state: GameState, dtSeconds: number): GameState {
  const dt = safeDelta(dtSeconds);
  if (dt === 0 || !state.currentIslandId || state.destinationIslandId) {
    return state;
  }

  const island = state.islands[state.currentIslandId];
  const gathering = state.skills.gathering;
  if (!island || !gathering) return state;

  const bargaining = state.skills.bargaining;
  const goldMultiplier = bargaining ? skillEffect(bargaining) : 1;
  const rate =
    gatherRate(gathering.level, gathering.effectPerLevel) * dt;
  const inventory = { ...state.inventory };

  for (const resource of island.resources) {
    const multiplier = resource === "gold" ? goldMultiplier : 1;
    inventory[resource] = (inventory[resource] ?? 0) + rate * multiplier;
  }

  let skills: Record<string, Skill> = {
    ...state.skills,
    gathering: applyXp(gathering, dt * GATHER_XP_PER_SECOND),
  };

  if (bargaining && island.resources.includes("gold")) {
    skills = {
      ...skills,
      bargaining: applyXp(bargaining, dt * BARGAINING_XP_PER_SECOND),
    };
  }

  return { ...state, inventory, skills };
}

/**
 * Fast tick: the skill selected by the player gains XP continuously, even
 * while travelling or gathering. This is the part that runs every 50ms.
 */
export function trainActiveSkill(
  state: GameState,
  dtSeconds: number,
): GameState {
  const dt = safeDelta(dtSeconds);
  const skillId = state.activeSkillId;
  if (dt === 0 || !skillId) return state;

  const skill = state.skills[skillId];
  if (!skill) return state;

  return {
    ...state,
    skills: {
      ...state.skills,
      [skillId]: applyXp(skill, dt * skill.xpPerSecond),
    },
  };
}

/**
 * Slow tick: one second of travel + gathering. Travel and arrival deliberately
 * stay on this 1s cadence so the map countdown is stable.
 */
export function tickWorld(state: GameState, dtSeconds: number): GameState {
  const dt = safeDelta(dtSeconds);
  if (dt === 0) return state;

  const travelled = travelFor(state, dt);
  return gatherFor(travelled.state, travelled.remainingSeconds);
}

function applyTimeChunk(state: GameState, seconds: number): GameState {
  let next = trainActiveSkill(state, seconds);
  const storedAccumulator = Number.isFinite(next.worldAccumulatorMs)
    ? next.worldAccumulatorMs
    : 0;
  let accumulator = Math.max(0, storedAccumulator) + seconds * 1000;

  while (accumulator >= WORLD_TICK_MS) {
    next = tickWorld(next, WORLD_TICK_MS / 1000);
    accumulator -= WORLD_TICK_MS;
  }

  return { ...next, worldAccumulatorMs: accumulator };
}

/**
 * Advances the whole game by `dtSeconds` of real time.
 *
 * A single logical loop drives two rates:
 * - skills are trained for the full delta (the caller runs this every 50ms);
 * - the world accumulates that delta and runs exact 1s travel/gather ticks.
 */
export function advanceGame(state: GameState, dtSeconds: number): GameState {
  const dt = safeDelta(dtSeconds);
  if (dt === 0) return state;

  let remaining = dt;
  let next = state;

  while (remaining > 0.000001) {
    const step = Math.min(remaining, OFFLINE_STEP_SECONDS);
    next = applyTimeChunk(next, step);
    remaining -= step;
  }

  return { ...next, totalPlaytime: state.totalPlaytime + dt };
}

/** Backwards-compatible alias used by the store and tests. */
export function applyTick(state: GameState, dtSeconds: number): GameState {
  return advanceGame(state, dtSeconds);
}

/** Applies a long span of time safely, in 60s slices. */
export function applyElapsed(state: GameState, seconds: number): GameState {
  return advanceGame(state, seconds);
}

export function applyOfflineProgress(
  state: GameState,
  now: number,
  capSeconds = OFFLINE_CAP_SECONDS,
): GameState {
  const { elapsedSeconds } = accumulateTicks(state.lastTick, now, capSeconds);
  return { ...advanceGame(state, elapsedSeconds), lastTick: now };
}
