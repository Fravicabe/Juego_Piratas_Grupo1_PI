import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";

describe("resource island progression", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("goes Tortuga -> Nassau -> Skull Isle using gathered resources", () => {
    useGameStore.getState().hydrate(createInitialState(0));

    // Tortuga produces only wood.
    useGameStore.getState().tick(30);
    expect(useGameStore.getState().inventory.wood).toBeGreaterThanOrEqual(30);
    expect(useGameStore.getState().inventory.iron).toBe(0);

    // Nassau costs wood and produces iron.
    expect(useGameStore.getState().unlockIsland("nassau")).toBe(true);
    expect(useGameStore.getState().islands.nassau.unlocked).toBe(true);

    useGameStore.getState().setDestination("nassau");
    useGameStore.getState().tick(60);
    expect(useGameStore.getState().currentIslandId).toBe("nassau");

    useGameStore.getState().tick(30);
    expect(useGameStore.getState().inventory.iron).toBeGreaterThanOrEqual(30);

    // Back to Tortuga for more wood.
    useGameStore.getState().setDestination("tortuga");
    useGameStore.getState().tick(60);
    expect(useGameStore.getState().currentIslandId).toBe("tortuga");

    useGameStore.getState().tick(50);
    expect(useGameStore.getState().inventory.wood).toBeGreaterThanOrEqual(50);

    // Skull Isle costs wood + iron and produces gold.
    expect(useGameStore.getState().unlockIsland("skull_isle")).toBe(true);
    expect(useGameStore.getState().islands.skull_isle.unlocked).toBe(true);

    useGameStore.getState().setDestination("skull_isle");
    useGameStore.getState().tick(200);

    expect(useGameStore.getState().currentIslandId).toBe("skull_isle");
    expect(useGameStore.getState().inventory.gold).toBeGreaterThan(0);
  });
});
