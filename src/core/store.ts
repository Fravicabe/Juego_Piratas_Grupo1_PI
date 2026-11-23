import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GameState, ResourceId } from "./types";
import { createInitialState } from "./initialState";
import { getIslandUnlockStatus } from "./islands";
import { clearSave } from "./saveLoad";
import { skillEffect } from "./skills";
import {
  advanceGame,
  applyXp,
  arriveAtDestination,
  gatherFor,
} from "./tick";

export interface GameStore extends GameState {
  setDestination: (islandId: string) => void;
  setActiveSkill: (skillId: string) => void;
  unlockIsland: (islandId: string) => boolean;
  arrive: () => void;
  gather: (dtSeconds: number) => void;
  addXp: (skillId: string, amount: number) => void;
  tick: (dtSeconds: number, now?: number) => void;
  hydrate: (state: GameState) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...createInitialState(),

    setDestination: (islandId) =>
      set((s) => {
        const island = s.islands[islandId];
        if (!island || !island.unlocked || islandId === s.currentIslandId) return;
        if (s.destinationIslandId) return;
        if (!s.discoveredIslands.includes(islandId)) return;

        const sailingLevel = s.skills.sailing?.level ?? 1;
        if (island.lockedUntilLevel && sailingLevel < island.lockedUntilLevel) {
          return;
        }

        const current = s.currentIslandId ? s.islands[s.currentIslandId] : undefined;
        const distance = island.travelTimeBase - (current?.travelTimeBase ?? 0);
        const sailing = s.skills.sailing;
        const speedMultiplier = sailing ? skillEffect(sailing) : 1;
        const speed = Math.max(0.1, s.ship.speed * speedMultiplier);

        s.destinationIslandId = islandId;
        s.travelEta = Math.max(1, Math.abs(distance) / speed);
      }),

    unlockIsland: (islandId) => {
      const status = getIslandUnlockStatus(get(), islandId);
      if (!status.canUnlock) return false;

      set((s) => {
        const island = s.islands[islandId];
        if (!island?.unlockCost) return;

        for (const [resourceId, amount] of Object.entries(island.unlockCost)) {
          const rid = resourceId as ResourceId;
          s.inventory[rid] = (s.inventory[rid] ?? 0) - amount;
        }

        island.unlocked = true;

        // An unlocked island is known on the map, so the player can sail to it.
        if (!s.discoveredIslands.includes(islandId)) {
          s.discoveredIslands = [...s.discoveredIslands, islandId];
        }
      });

      return true;
    },

    setActiveSkill: (skillId) =>
      set((s) => {
        if (!s.skills[skillId]) return;
        s.activeSkillId = skillId;
      }),

    arrive: () =>
      set((s) => {
        Object.assign(s, arriveAtDestination(s as GameState));
      }),

    gather: (dtSeconds) =>
      set((s) => {
        Object.assign(s, gatherFor(s as GameState, dtSeconds));
      }),

    addXp: (skillId, amount) =>
      set((s) => {
        const skill = s.skills[skillId];
        if (!skill) return;
        s.skills[skillId] = applyXp(skill, amount);
      }),

    tick: (dtSeconds, now = Date.now()) =>
      set((s) => {
        Object.assign(s, advanceGame(s as GameState, dtSeconds));
        s.lastTick = now;
      }),

    hydrate: (state) =>
      set((s) => {
        Object.assign(s, state);
      }),

    reset: () => {
      clearSave();
      set((s) => {
        Object.assign(s, createInitialState());
      });
    },
  })),
);

/**
 * Returns only the serializable game state, without the Zustand actions.
 */
export function getGameState(): GameState {
  const s = useGameStore.getState();
  return {
    version: s.version,
    player: s.player,
    ship: s.ship,
    crew: s.crew,
    skills: s.skills,
    activeSkillId: s.activeSkillId,
    islands: s.islands,
    discoveredIslands: s.discoveredIslands,
    currentIslandId: s.currentIslandId,
    destinationIslandId: s.destinationIslandId,
    travelEta: s.travelEta,
    inventory: s.inventory,
    lastTick: s.lastTick,
    worldAccumulatorMs: s.worldAccumulatorMs,
    totalPlaytime: s.totalPlaytime,
  };
}
