import { beforeEach, describe, expect, it } from "vitest";
import v1Save from "../fixtures/saves/v1.json";
import v2Save from "../fixtures/saves/v2.json";
import v3Save from "../fixtures/saves/v3.json";
import { loadGame, SAVE_KEY } from "../../src/core/saveLoad";
import { xpForLevel } from "../../src/core/skills";

function loadFixture(save: unknown) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  return loadGame();
}

describe("save fixtures", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps the fixtures at their original schema version", () => {
    expect(v1Save.version).toBe(1);
    expect(v2Save.version).toBe(2);
    expect(v3Save.version).toBe(3);
  });

  it("migrates the v1 fixture to the current schema", () => {
    const loaded = loadFixture(v1Save);

    expect(loaded?.version).toBe(3);
    expect(loaded?.skills.sailing.level).toBe(4);
    expect(loaded?.skills.sailing.xp).toBe(10);
    expect(loaded?.skills.sailing.xpToNext).toBe(xpForLevel(4));
    expect(loaded?.skills.bargaining.level).toBe(1);
    expect(loaded?.activeSkillId).toBe("gathering");
    expect(loaded?.worldAccumulatorMs).toBe(0);
    expect(loaded?.inventory).toEqual({
      wood: 120,
      iron: 40,
      food: 55,
      gold: 15,
    });
    expect(loaded?.islands.nassau.unlocked).toBe(false);
    expect(loaded?.currentIslandId).toBe("tortuga");
  });

  it("migrates the v2 fixture and resets resource-gated islands", () => {
    const loaded = loadFixture(v2Save);

    expect(loaded?.version).toBe(3);
    expect(loaded?.skills.bargaining.level).toBe(3);
    expect(loaded?.activeSkillId).toBe("sailing");
    expect(loaded?.worldAccumulatorMs).toBe(250);
    expect(loaded?.totalPlaytime).toBe(2400);
    expect(loaded?.islands.nassau.unlocked).toBe(false);
    expect(loaded?.islands.skull_isle.unlocked).toBe(false);
    expect(loaded?.currentIslandId).toBe("tortuga");
  });

  it("loads the v3 fixture without losing progress", () => {
    const loaded = loadFixture(v3Save);

    expect(loaded?.version).toBe(3);
    expect(loaded?.skills.bargaining.level).toBe(2);
    expect(loaded?.activeSkillId).toBe("gathering");
    expect(loaded?.worldAccumulatorMs).toBe(750);
    expect(loaded?.inventory.gold).toBe(140);
    expect(loaded?.islands.nassau.unlocked).toBe(true);
    expect(loaded?.islands.skull_isle.unlocked).toBe(false);
    expect(loaded?.currentIslandId).toBe("nassau");
    expect(loaded?.discoveredIslands).toEqual(["tortuga", "nassau"]);
  });
});
