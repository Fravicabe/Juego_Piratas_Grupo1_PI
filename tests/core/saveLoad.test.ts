import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { applyXp, xpForLevel } from "../../src/core/skills";
import {
  clearSave,
  loadGame,
  saveGame,
  SAVE_KEY,
} from "../../src/core/saveLoad";

describe("save/load", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips the game state", () => {
    const state = createInitialState(1234);
    state.inventory.wood = 42;
    state.skills.gathering = applyXp(state.skills.gathering, 1000);
    state.activeSkillId = "sailing";
    state.worldAccumulatorMs = 250;

    saveGame(state);

    expect(loadGame()).toEqual(state);
  });

  it("returns null when there is no save", () => {
    expect(loadGame()).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(SAVE_KEY, "{not valid json");
    expect(loadGame()).toBeNull();
  });

  it("returns null for an unknown schema version", () => {
    const state = createInitialState(1234);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, version: 999 }));

    expect(loadGame()).toBeNull();
  });

  it("rejects saves without skills or islands", () => {
    const state = createInitialState(1234);
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...state, skills: {}, islands: {} }),
    );

    expect(loadGame()).toBeNull();
  });

  it("migrates a v1 save and adds the new skills", () => {
    const oldState = createInitialState(1234) as unknown as Record<
      string,
      unknown
    >;
    oldState.version = 1;
    oldState.skills = {
      sailing: {
        id: "sailing",
        name: "Sailing",
        level: 4,
        xp: 10,
        xpToNext: 337,
      },
      gathering: {
        id: "gathering",
        name: "Gathering",
        level: 2,
        xp: 5,
        xpToNext: 150,
      },
    };
    delete oldState.activeSkillId;
    delete oldState.worldAccumulatorMs;

    localStorage.setItem(SAVE_KEY, JSON.stringify(oldState));

    const loaded = loadGame();

    expect(loaded?.version).toBe(2);
    expect(loaded?.skills.sailing.level).toBe(4);
    expect(loaded?.skills.sailing.xp).toBe(10);
    expect(loaded?.skills.sailing.xpToNext).toBe(xpForLevel(4));
    expect(loaded?.skills.gathering.level).toBe(2);
    expect(loaded?.skills.bargaining.level).toBe(1);
    expect(loaded?.activeSkillId).toBe("gathering");
    expect(loaded?.worldAccumulatorMs).toBe(0);
  });

  it("falls back to the island data when a saved island is malformed", () => {
    const state = createInitialState(1234);
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...state,
        islands: { ...state.islands, tortuga: {} },
      }),
    );

    const loaded = loadGame();

    expect(loaded?.islands.tortuga.resources).toEqual(["wood"]);
    expect(loaded?.islands.tortuga.travelTimeBase).toBe(0);
  });

  it("levels up a migrated skill when its old XP exceeds the new curve", () => {
    const oldState = createInitialState(1234) as unknown as Record<
      string,
      unknown
    >;
    oldState.version = 1;
    oldState.skills = {
      sailing: {
        id: "sailing",
        name: "Sailing",
        level: 1,
        xp: 500,
        xpToNext: 100,
      },
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(oldState));

    const loaded = loadGame();

    expect(loaded?.skills.sailing.level).toBeGreaterThan(2);
    expect(loaded?.skills.sailing.xp).toBeLessThan(
      loaded?.skills.sailing.xpToNext ?? 0,
    );
  });

  it("clears the save", () => {
    saveGame(createInitialState(1234));
    clearSave();

    expect(loadGame()).toBeNull();
  });
});
