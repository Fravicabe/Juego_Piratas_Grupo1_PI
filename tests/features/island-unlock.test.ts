import { describe, it, expect } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";

describe("island unlock", () => {
  it("unlocks Nassau by paying 30 wood", () => {
    const state = createInitialState(0);
    state.inventory.wood = 30;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("nassau");

    const s = useGameStore.getState();
    expect(s.islands.nassau.unlocked).toBe(true);
    expect(s.inventory.wood).toBe(0);
    expect(s.discoveredIslands).toContain("nassau");
  });

  it("does not unlock Nassau without enough wood", () => {
    const state = createInitialState(0);
    state.inventory.wood = 10;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("nassau");

    const s = useGameStore.getState();
    expect(s.islands.nassau.unlocked).toBe(false);
    expect(s.inventory.wood).toBe(10);
  });

  it("unlocks Skull Isle by paying 50 wood and 30 iron", () => {
    const state = createInitialState(0);
    state.inventory.wood = 50;
    state.inventory.iron = 30;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("skull_isle");

    const s = useGameStore.getState();
    expect(s.islands.skull_isle.unlocked).toBe(true);
    expect(s.inventory.wood).toBe(0);
    expect(s.inventory.iron).toBe(0);
    expect(s.discoveredIslands).toContain("skull_isle");
  });

  it("does not unlock Skull Isle without enough wood", () => {
    const state = createInitialState(0);
    state.inventory.wood = 10;
    state.inventory.iron = 30;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("skull_isle");

    const s = useGameStore.getState();
    expect(s.islands.skull_isle.unlocked).toBe(false);
    expect(s.inventory.wood).toBe(10);
    expect(s.inventory.iron).toBe(30);
  });

  it("does not unlock Skull Isle without enough iron", () => {
    const state = createInitialState(0);
    state.inventory.wood = 50;
    state.inventory.iron = 10;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("skull_isle");

    const s = useGameStore.getState();
    expect(s.islands.skull_isle.unlocked).toBe(false);
    expect(s.inventory.wood).toBe(50);
    expect(s.inventory.iron).toBe(10);
  });

  it("cannot unlock an already unlocked island", () => {
    const state = createInitialState(0);
    state.inventory.wood = 100;
    useGameStore.getState().hydrate(state);

    useGameStore.getState().unlockIsland("tortuga");

    const s = useGameStore.getState();
    expect(s.inventory.wood).toBe(100); // no cost deducted
  });
});
