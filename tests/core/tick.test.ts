import { describe, it, expect } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import {
  accumulateTicks,
  advanceGame,
  applyElapsed,
  applyOfflineProgress,
  applyTick,
  applyXp,
  gatherRate,
  gatherRateForResource,
  xpForLevel,
} from "../../src/core/tick";
import { createSkill, SKILL_DEFINITIONS } from "../../src/core/skills";

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
  it("uses the Progress Knight-style XP curve", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(202);
    expect(xpForLevel(3)).toBe(306);
    expect(xpForLevel(10)).toBe(1094);
  });

  it("levels up and carries leftover XP", () => {
    const skill = createSkill(SKILL_DEFINITIONS.gathering);

    const next = applyXp(skill, 350);

    expect(next.level).toBe(3);
    expect(next.xp).toBe(48);
    expect(next.xpToNext).toBe(306);
  });

  it("never loses XP when a single grant spans several levels", () => {
    const skill = createSkill(SKILL_DEFINITIONS.gathering);

    const next = applyXp(skill, 100 + 202 + 306 + 10);

    expect(next.level).toBe(4);
    expect(next.xp).toBe(10);
  });

  it("keeps the gathering rate neutral at level 1 and scales it afterwards", () => {
    expect(gatherRate(1)).toBe(1);
    expect(gatherRate(3)).toBeCloseTo(1.1);
    expect(gatherRate(3, 0.25)).toBe(1.5);
  });

  it("applies bargaining only to the gold gathering rate", () => {
    const state = createInitialState(0);
    state.skills.gathering.level = 3;
    state.skills.bargaining.level = 3;

    expect(gatherRateForResource(state, "wood")).toBeCloseTo(1.1);
    expect(gatherRateForResource(state, "iron")).toBeCloseTo(1.1);
    expect(gatherRateForResource(state, "gold")).toBeCloseTo(1.1 * 1.06);
  });
});

describe("multi-rate game loop", () => {
  it("trains the active skill on the fast tick without running a world tick", () => {
    const state = createInitialState(0);
    state.activeSkillId = "sailing";

    const next = advanceGame(state, 0.05);

    expect(next.skills.sailing.xp).toBeCloseTo(0.1);
    expect(next.inventory.wood).toBe(0);
    expect(next.worldAccumulatorMs).toBe(50);
    expect(next.totalPlaytime).toBeCloseTo(0.05);
  });

  it("runs travel and gathering only once a full second has accumulated", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;

    const half = advanceGame(state, 0.5);
    expect(half.inventory.wood).toBe(0);
    expect(half.worldAccumulatorMs).toBe(500);

    const full = advanceGame(half, 0.5);
    expect(full.inventory.wood).toBe(1);
    expect(full.worldAccumulatorMs).toBe(0);
    expect(full.totalPlaytime).toBe(1);
  });

  it("runs exactly one world tick after twenty 50ms fast ticks", () => {
    let state = createInitialState(0);
    state.activeSkillId = null;

    for (let i = 0; i < 20; i += 1) {
      state = advanceGame(state, 0.05);
    }

    expect(state.inventory.wood).toBe(1);
    expect(state.worldAccumulatorMs).toBe(0);
    expect(state.totalPlaytime).toBeCloseTo(1);
  });

  it("counts down travel on 1s world ticks", () => {
    const state = createInitialState(0);
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyTick(state, 10);

    expect(next.travelEta).toBe(20);
    expect(next.currentIslandId).toBe("tortuga");
    expect(next.totalPlaytime).toBe(10);
    expect(next.inventory.wood).toBe(0);
    expect(next.skills.sailing.xp).toBeCloseTo(10);
  });

  it("arrives and gathers with the remaining time", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyTick(state, 40);

    expect(next.currentIslandId).toBe("nassau");
    expect(next.destinationIslandId).toBeNull();
    expect(next.travelEta).toBe(0);
    expect(next.discoveredIslands).toContain("nassau");
    expect(next.inventory.iron).toBeCloseTo(10);
    expect(next.totalPlaytime).toBe(40);
  });

  it("gathers at the current island when not travelling", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;
    const next = applyTick(state, 10);

    expect(next.inventory.wood).toBe(10);
    expect(next.skills.gathering.level).toBe(1);
    expect(next.skills.gathering.xp).toBe(80);
    expect(next.totalPlaytime).toBe(10);
  });

  it("lets the active skill level up independently of travel", () => {
    const state = createInitialState(0);
    state.activeSkillId = "sailing";

    const next = applyTick(state, 50);

    expect(next.skills.sailing.level).toBe(2);
    expect(next.skills.sailing.xp).toBe(0);
  });

  it("makes the sailing skill shorten travel time", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;
    state.skills.sailing.level = 2;
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyTick(state, 10);

    expect(next.travelEta).toBeCloseTo(19.8);
    expect(next.totalPlaytime).toBe(10);
  });

  it("makes bargaining multiply gold without touching other resources", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;
    state.currentIslandId = "skull_isle";
    state.discoveredIslands = ["tortuga", "skull_isle"];
    state.islands.skull_isle.unlocked = true;
    state.skills.bargaining.level = 2;

    const next = applyTick(state, 10);

    expect(next.inventory.gold).toBeCloseTo(10.3);
    expect(next.skills.bargaining.xp).toBeCloseTo(10);
  });

  it("advances long spans safely in chunks", () => {
    const state = createInitialState(0);
    const next = applyElapsed(state, 120);

    expect(next.totalPlaytime).toBe(120);
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

  it("progresses the active skill while offline", () => {
    const state = createInitialState(0);
    state.activeSkillId = "sailing";

    const next = applyOfflineProgress(state, 60 * 60 * 1000);

    expect(next.skills.sailing.level).toBeGreaterThan(10);
    expect(next.skills.gathering.level).toBeGreaterThan(1);
  });

  it("keeps travel on the 1s rate during offline catch-up", () => {
    const state = createInitialState(0);
    state.activeSkillId = null;
    state.destinationIslandId = "nassau";
    state.travelEta = 30;

    const next = applyOfflineProgress(state, 60_000);

    expect(next.currentIslandId).toBe("nassau");
    expect(next.destinationIslandId).toBeNull();
    expect(next.inventory.iron).toBeGreaterThan(0);
  });
});
