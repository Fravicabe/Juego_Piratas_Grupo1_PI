import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GameState, ResourceId } from "./types";
import { createInitialState } from "./initialState";
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
  unlockIsland: (islandId: string) => void;
  arrive: () => void;
  gather: (dtSeconds: number) => void;
  addXp: (skillId: string, amount: number) => void;
  tick: (dtSeconds: number, now?: number) => void;
  hydrate: (state: GameState) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...createInitialState(),

    setDestination: (islandId) =>
      set((s) => {
        const island = s.islands[islandId];
        if (!island || !island.unlocked || islandId === s.currentIslandId) return;

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

    unlockIsland: (islandId) =>
      set((s) => {
        const island = s.islands[islandId];
        if (!island || island.unlocked) return;

        const cost = island.unlockCost;
        if (!cost) return;

        // Check player can afford the cost
        for (const [resourceId, amount] of Object.entries(cost)) {
          const rid = resourceId as ResourceId;
          if ((s.inventory[rid] ?? 0) < amount) return;
        }

        // Deduct cost
        const inventory = { ...s.inventory };
        for (const [resourceId, amount] of Object.entries(cost)) {
          const rid = resourceId as ResourceId;
          inventory[rid] = (inventory[rid] ?? 0) - amount;
        }

        s.inventory = inventory;
        s.islands[islandId] = { ...island, unlocked: true };

        // Mark as discovered so the player can sail there
        if (!s.discoveredIslands.includes(islandId)) {
          s.discoveredIslands = [...s.discoveredIslands, islandId];
        }
      }),

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
