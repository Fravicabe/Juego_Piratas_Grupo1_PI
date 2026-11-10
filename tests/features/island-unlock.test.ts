import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { getIslandUnlockStatus } from "../../src/core/islands";
import { useGameStore } from "../../src/core/store";

describe("island unlock", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("unlocks Nassau by paying 30 wood", () => {
    const state = createInitialState(0);
    state.inventory.wood = 30;
    useGameStore.getState().hydrate(state);

    const unlocked = useGameStore.getState().unlockIsland("nassau");

    const s = useGameStore.getState();
    expect(unlocked).toBe(true);
    expect(s.islands.nassau.unlocked).toBe(true);
    expect(s.inventory.wood).toBe(0);
    expect(s.discoveredIslands).toContain("nassau");
  });

  it("does not unlock Nassau without enough wood", () => {
    const state = createInitialState(0);
    state.inventory.wood = 10;
    useGameStore.getState().hydrate(state);

    const unlocked = useGameStore.getState().unlockIsland("nassau");

    const s = useGameStore.getState();
    expect(unlocked).toBe(false);
    expect(s.islands.nassau.unlocked).toBe(false);
    expect(s.inventory.wood).toBe(10);
  });

  it("requires Nassau before Skull Isle even with enough resources", () => {
    const state = createInitialState(0);
    state.inventory.wood = 80;
    state.inventory.iron = 30;
    useGameStore.getState().hydrate(state);

    const unlocked = useGameStore.getState().unlockIsland("skull_isle");

    const s = useGameStore.getState();
    expect(unlocked).toBe(false);
    expect(s.islands.skull_isle.unlocked).toBe(false);
    expect(s.inventory.wood).toBe(80);
    expect(s.inventory.iron).toBe(30);
  });

  it("unlocks Skull Isle by paying 50 wood and 30 iron after Nassau", () => {
    const state = createInitialState(0);
    state.inventory.wood = 80;
    state.inventory.iron = 30;
    useGameStore.getState().hydrate(state);

    expect(useGameStore.getState().unlockIsland("nassau")).toBe(true);
    expect(useGameStore.getState().unlockIsland("skull_isle")).toBe(true);

    const s = useGameStore.getState();
    expect(s.islands.skull_isle.unlocked).toBe(true);
    expect(s.inventory.wood).toBe(0);
    expect(s.inventory.iron).toBe(0);
    expect(s.discoveredIslands).toContain("skull_isle");
  });

  it("does not unlock Skull Isle without enough wood", () => {
    const state = createInitialState(0);
    state.islands.nassau.unlocked = true;
    state.discoveredIslands.push("nassau");
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
    state.islands.nassau.unlocked = true;
    state.discoveredIslands.push("nassau");
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

    const unlocked = useGameStore.getState().unlockIsland("tortuga");

    const s = useGameStore.getState();
    expect(unlocked).toBe(false);
    expect(s.inventory.wood).toBe(100); // no cost deducted
  });
});

describe("getIslandUnlockStatus", () => {
  it("reports missing resources and the previous island requirement", () => {
    const state = createInitialState(0);
    state.inventory.wood = 12;
    state.inventory.iron = 30;

    const nassau = getIslandUnlockStatus(state, "nassau");
    expect(nassau.canUnlock).toBe(false);
    expect(nassau.missingResources).toEqual([
      { id: "wood", required: 30, missing: 18 },
    ]);

    const skull = getIslandUnlockStatus(state, "skull_isle");
    expect(skull.previousIslandUnlocked).toBe(false);
    expect(skull.hasCost).toBe(true);
    expect(skull.canUnlock).toBe(false);
  });

  it("allows unlocking once the cost and chain requirements are met", () => {
    const state = createInitialState(0);
    state.inventory.wood = 80;
    state.inventory.iron = 30;

    expect(getIslandUnlockStatus(state, "nassau").canUnlock).toBe(true);

    state.islands.nassau.unlocked = true;
    state.inventory.wood = 50;

    expect(getIslandUnlockStatus(state, "skull_isle").canUnlock).toBe(true);
  });
});
