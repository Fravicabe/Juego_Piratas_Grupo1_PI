// Progress Knight-style skill math. Kept pure so the tick loop and tests can
// share exactly the same formulas.

import skillsJson from "../data/skills.json";
import type { Skill, SkillDefinition } from "./types";

export const XP_BASE = 100;
export const XP_LEVEL_GROWTH = 1.01;
export const DEFAULT_ACTIVE_SKILL_ID = "gathering";

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {};

for (const definition of skillsJson as SkillDefinition[]) {
  SKILL_DEFINITIONS[definition.id] = definition;
}

/**
 * Progress Knight uses `baseXp * (level + 1) * 1.01^level`. Our skills start
 * at level 1, so the equivalent formula is `baseXp * level * 1.01^(level - 1)`.
 */
export function xpForLevel(level: number, baseXp = XP_BASE): number {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  const safeBase = Math.max(1, Number(baseXp) || XP_BASE);
  return Math.max(
    1,
    Math.round(safeBase * safeLevel * Math.pow(XP_LEVEL_GROWTH, safeLevel - 1)),
  );
}

/**
 * Adds XP and applies every level-up it unlocks. `xpToNext` is always
 * recalculated from the level so balance changes and old saves stay valid.
 */
export function applyXp(skill: Skill, amount: number): Skill {
  const baseXp = Number.isFinite(skill.baseXp) ? skill.baseXp : XP_BASE;
  let level = Math.max(1, Math.floor(Number(skill.level) || 1));
  let xp =
    Math.max(0, Number(skill.xp) || 0) + Math.max(0, Number(amount) || 0);
  let xpToNext = xpForLevel(level, baseXp);
  let guard = 0;

  while (xp >= xpToNext && guard < 10_000) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level, baseXp);
    guard += 1;
  }

  return { ...skill, level, xp, xpToNext };
}

/**
 * Multiplier granted by a skill. Level 1 is the neutral value (1x).
 */
export function skillEffect(skill: Skill): number {
  const level = Math.max(1, Math.floor(Number(skill.level) || 1));
  const perLevel = skill.effectPerLevel ?? 0;
  return 1 + Math.max(0, level - 1) * perLevel;
}

export function createSkill(definition: SkillDefinition): Skill {
  return {
    ...definition,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1, definition.baseXp),
  };
}

export function createSkills(): Record<string, Skill> {
  const skills: Record<string, Skill> = {};

  for (const [id, definition] of Object.entries(SKILL_DEFINITIONS)) {
    skills[id] = createSkill(definition);
  }

  return skills;
}

function normalizeSkill(
  definition: SkillDefinition,
  saved: Partial<Skill> | undefined,
): Skill {
  const level = Math.max(1, Math.floor(Number(saved?.level) || 1));
  const xp = Math.max(0, Number(saved?.xp) || 0);

  return applyXp(
    {
      ...definition,
      level,
      xp,
      xpToNext: xpForLevel(level, definition.baseXp),
    },
    0,
  );
}

/**
 * Rebuilds the skill map from the current definitions, keeping saved levels
 * and XP. Unknown or removed skills are dropped, missing skills are added.
 */
export function normalizeSkills(
  saved: Record<string, Partial<Skill>> | undefined,
): Record<string, Skill> {
  const skills: Record<string, Skill> = {};

  for (const [id, definition] of Object.entries(SKILL_DEFINITIONS)) {
    skills[id] = normalizeSkill(definition, saved?.[id]);
  }

  return skills;
}
