import { describe, it, expect } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import {
  accumulateTicks,
  applyElapsed,
  applyOfflineProgress,
  applyTick,
  applyXp,
  gatherRate,
  xpForLevel,
} from "../../src/core/tick";
import type { Skill } from "../../src/core/types";

describe("accumulateTicks", () => {
  it("returns elapsed seconds", () => {
    const r = accumulateTicks(0, 5000, 1000);
    expect(r.elapsedSeconds).toBe(5);
  });

  it("caps at capSeconds", () => {
    const r = accumulateTicks(0, 100000 * 1000, 1000);
    expect(r.elapsedSeconds).toBe(1000);
  });

  it("never returns a negative elapsed time", () => {
    const r = accumulateTicks(5000, 0, 1000);
    expect(r.elapsedSeconds).toBe(0);
  });
});

describe("XP helpers", () => {
  it("creates an increasing XP curve", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(150);
    expect(xpForLevel(3)).toBe(225);
  });

  it("levels up and carries leftover XP", () => {
    const skill: Skill = {
      id: "gathering",
      name: "Gathering",
      level: 1,
      xp: 0,
      xpToNext: 100,
    };

    const next = applyXp(skill, 250);

    expect(next.level).toBe(3);
    expect(next.xp).toBe(0);
    expect(next.xpToNext).toBe(225);
  });

  it("increases the gather rate with the level", () => {
    expect(gatherRate(1)).toBe(1);
    expect(gatherRate(3)).toBe(1.5);
  });
});

describe("applyTick", () => {
  it("counts down travel without arriving", () => {
    const state = createInitialState(0);
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyTick(state, 10);

    expect(next.travelEta).toBe(20);
    expect(next.currentIslandId).toBe("tortuga");
    expect(next.totalPlaytime).toBe(10);
    expect(next.inventory.wood).toBe(0);
  });

  it("arrives and gathers with the remaining time", () => {
    const state = createInitialState(0);
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyTick(state, 40);

    expect(next.currentIslandId).toBe("nassau");
    expect(next.destinationIslandId).toBeNull();
    expect(next.travelEta).toBe(0);
    expect(next.discoveredIslands).toContain("nassau");
    expect(next.inventory.iron).toBeGreaterThan(0);
    expect(next.totalPlaytime).toBe(40);
  });

  it("gathers at the current island when not travelling", () => {
    const state = createInitialState(0);
    const next = applyTick(state, 10);

    expect(next.inventory.wood).toBe(10);
    expect(next.inventory.food).toBe(10);
    expect(next.skills.gathering.level).toBe(2);
    expect(next.totalPlaytime).toBe(10);
  });
});

describe("offline progress", () => {
  it("applies the elapsed time", () => {
    const state = createInitialState(0);
    const next = applyOfflineProgress(state, 60_000);

    expect(next.totalPlaytime).toBe(60);
    expect(next.lastTick).toBe(60_000);
    expect(next.inventory.wood).toBeGreaterThan(0);
  });

  it("caps offline progress at eight hours", () => {
    const state = createInitialState(0);
    const next = applyOfflineProgress(state, 24 * 60 * 60 * 1000);

    expect(next.totalPlaytime).toBe(8 * 60 * 60);
  });

  it("advances long spans safely in chunks", () => {
    const state = createInitialState(0);
    const next = applyElapsed(state, 120);

    expect(next.totalPlaytime).toBe(120);
  });
});
