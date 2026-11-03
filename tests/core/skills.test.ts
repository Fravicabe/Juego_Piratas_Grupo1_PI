import { describe, expect, it } from "vitest";
import {
  applyXp,
  createSkill,
  createSkills,
  normalizeSkills,
  SKILL_DEFINITIONS,
  skillEffect,
  xpForLevel,
} from "../../src/core/skills";
import type { Skill } from "../../src/core/types";

describe("skill definitions", () => {
  it("creates every data-driven skill at level 1", () => {
    const skills = createSkills();

    expect(Object.keys(skills).sort()).toEqual([
      "bargaining",
      "gathering",
      "sailing",
    ]);
    for (const skill of Object.values(skills)) {
      expect(skill.level).toBe(1);
      expect(skill.xp).toBe(0);
      expect(skill.xpToNext).toBe(100);
    }
  });

  it("computes effects from the level", () => {
    const sailing = createSkill(SKILL_DEFINITIONS.sailing);
    const gathering = createSkill(SKILL_DEFINITIONS.gathering);
    const bargaining = createSkill(SKILL_DEFINITIONS.bargaining);

    expect(skillEffect(sailing)).toBe(1);
    expect(skillEffect({ ...sailing, level: 6 })).toBeCloseTo(1.1);
    expect(skillEffect({ ...gathering, level: 3 })).toBeCloseTo(1.1);
    expect(skillEffect({ ...bargaining, level: 11 })).toBeCloseTo(1.3);
  });
});

describe("skill normalization", () => {
  it("keeps saved levels and adds skills that did not exist yet", () => {
    const skills = normalizeSkills({
      sailing: {
        id: "sailing",
        name: "Sailing",
        level: 4,
        xp: 10,
        xpToNext: 337,
      } as Skill,
      removed_skill: {
        id: "removed_skill",
        name: "Removed",
        level: 99,
        xp: 0,
        xpToNext: 1,
      } as Skill,
    });

    expect(skills.sailing.level).toBe(4);
    expect(skills.sailing.xp).toBe(10);
    expect(skills.sailing.xpToNext).toBe(xpForLevel(4));
    expect(skills.gathering.level).toBe(1);
    expect(skills.bargaining.level).toBe(1);
    expect(skills.removed_skill).toBeUndefined();
  });

  it("applies level-ups when an old save has more XP than the new curve needs", () => {
    const skills = normalizeSkills({
      gathering: {
        id: "gathering",
        name: "Gathering",
        level: 1,
        xp: 500,
        xpToNext: 500,
      } as Skill,
    });

    expect(skills.gathering.level).toBeGreaterThan(2);
    expect(skills.gathering.xp).toBeLessThan(skills.gathering.xpToNext);
  });

  it("recomputes xpToNext from the level instead of trusting the save", () => {
    const skills = normalizeSkills({
      bargaining: {
        id: "bargaining",
        name: "Bargaining",
        level: 3,
        xp: 0,
        xpToNext: 999999,
      } as Skill,
    });

    expect(skills.bargaining.xpToNext).toBe(xpForLevel(3));
  });

  it("does not change the original skill object", () => {
    const skill = createSkill(SKILL_DEFINITIONS.gathering);
    const next = applyXp(skill, 50);

    expect(skill.xp).toBe(0);
    expect(next.xp).toBe(50);
  });
});
