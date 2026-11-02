import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GameState } from "./types";
import { SCHEMA_VERSION } from "./types";

const initialState: GameState = {
  version: SCHEMA_VERSION,
  player: { name: "Captain", rank: "Cabin Boy", gold: 0 },
  ship: { id: "starter", name: "The Minnow", speed: 1, cargo: 50, hull: 100, maxHull: 100 },
  crew: [],
  skills: {},
  islands: {},
  discoveredIslands: [],
  currentIslandId: null,
  destinationIslandId: null,
  travelEta: 0,
  inventory: {},
  lastTick: Date.now(),
  totalPlaytime: 0,
};

interface GameStore extends GameState {
  setState: (partial: Partial<GameState>) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initialState,
    setState: (partial) => set((s) => Object.assign(s, partial)),
    reset: () => set(() => ({ ...initialState })),
  })),
);
