import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../src/core/store";

describe("game store", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("starts at Tortuga with an empty inventory", () => {
    const state = useGameStore.getState();

    expect(state.currentIslandId).toBe("tortuga");
    expect(state.destinationIslandId).toBeNull();
    expect(state.inventory.wood).toBe(0);
  });

  it("sets a destination and calculates the travel time", () => {
    useGameStore.getState().setDestination("nassau");

    const state = useGameStore.getState();
    expect(state.destinationIslandId).toBe("nassau");
    expect(state.travelEta).toBe(60);
  });

  it("arrives and discovers the island", () => {
    useGameStore.getState().setDestination("nassau");
    useGameStore.getState().arrive();

    const state = useGameStore.getState();
    expect(state.currentIslandId).toBe("nassau");
    expect(state.destinationIslandId).toBeNull();
    expect(state.discoveredIslands).toContain("nassau");
  });

  it("gathers resources and gains XP", () => {
    useGameStore.getState().gather(10);

    const state = useGameStore.getState();
    expect(state.inventory.wood).toBe(10);
    expect(state.skills.gathering.level).toBe(2);
  });

  it("ticks the game and advances playtime", () => {
    useGameStore.getState().tick(5);

    expect(useGameStore.getState().totalPlaytime).toBe(5);
  });
});
