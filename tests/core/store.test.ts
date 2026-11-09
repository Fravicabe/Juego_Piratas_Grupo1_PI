import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { getGameState, useGameStore } from "../../src/core/store";

describe("game store", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("starts at Tortuga with an empty inventory", () => {
    const state = useGameStore.getState();

    expect(state.currentIslandId).toBe("tortuga");
    expect(state.destinationIslandId).toBeNull();
    expect(state.inventory.wood).toBe(0);
    expect(state.activeSkillId).toBe("gathering");
  });

  it("sets a destination and calculates the travel time", () => {
    useGameStore.getState().setDestination("nassau");

    const state = useGameStore.getState();
    expect(state.destinationIslandId).toBe("nassau");
    expect(state.travelEta).toBe(60);
  });

  it("uses the sailing skill to shorten travel time", () => {
    const state = createInitialState(0);
    state.skills.sailing.level = 6; // +2% per level => 1.1x speed
    useGameStore.getState().hydrate(state);

    useGameStore.getState().setDestination("nassau");

    expect(useGameStore.getState().travelEta).toBeCloseTo(60 / 1.1);
  });

  it("switches the active skill and ignores unknown skills", () => {
    useGameStore.getState().setActiveSkill("sailing");
    expect(useGameStore.getState().activeSkillId).toBe("sailing");

    useGameStore.getState().setActiveSkill("not_a_skill");
    expect(useGameStore.getState().activeSkillId).toBe("sailing");
  });

  it("arrives and discovers the island", () => {
    useGameStore.getState().setDestination("nassau");
    useGameStore.getState().arrive();

    const state = useGameStore.getState();
    expect(state.currentIslandId).toBe("nassau");
    expect(state.destinationIslandId).toBeNull();
    expect(state.discoveredIslands).toContain("nassau");
  });

  it("gathers resources and gains activity XP", () => {
    useGameStore.getState().gather(10);

    const state = useGameStore.getState();
    expect(state.inventory.wood).toBe(10);
    expect(state.skills.gathering.xp).toBe(80);
  });

  it("ticks the game, trains the active skill and advances playtime", () => {
    useGameStore.getState().setActiveSkill("sailing");
    useGameStore.getState().tick(10);

    const state = useGameStore.getState();
    expect(state.totalPlaytime).toBe(10);
    expect(state.skills.sailing.xp).toBeCloseTo(20);
    expect(state.skills.gathering.xp).toBe(80);
    expect(state.inventory.wood).toBe(10);
  });

  it("exports the serializable state with the new fields", () => {
    const state = getGameState();

    expect(state.activeSkillId).toBe("gathering");
    expect(state.worldAccumulatorMs).toBe(0);
    expect(state.version).toBe(2);
  });
});
