import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GameState } from "./types";
import { createInitialState } from "./initialState";
import { clearSave } from "./saveLoad";
import { applyElapsed, applyXp, arriveAtDestination, gatherFor } from "./tick";

export interface GameStore extends GameState {
  setDestination: (islandId: string) => void;
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

        const current = s.currentIslandId ? s.islands[s.currentIslandId] : undefined;
        const distance = island.travelTimeBase - (current?.travelTimeBase ?? 0);
        const speed = Math.max(0.1, s.ship.speed);

        s.destinationIslandId = islandId;
        s.travelEta = Math.max(1, Math.abs(distance) / speed);
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
        Object.assign(s, applyElapsed(s as GameState, dtSeconds));
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
    islands: s.islands,
    discoveredIslands: s.discoveredIslands,
    currentIslandId: s.currentIslandId,
    destinationIslandId: s.destinationIslandId,
    travelEta: s.travelEta,
    inventory: s.inventory,
    lastTick: s.lastTick,
    totalPlaytime: s.totalPlaytime,
  };
}
