import { describe, it, expect } from "vitest";
import { xpForLevel, applyXp } from "../../src/core/tick";
import type { Skill } from "../../src/core/types";

describe("xpForLevel (curva lineal incremental)", () => {
  it("nivel 1 requiere 100 XP", () => {
    expect(xpForLevel(1)).toBe(100);
  });
  it("nivel 2 requiere 150 XP", () => {
    expect(xpForLevel(2)).toBe(150);
  });
  it("nivel 3 requiere 200 XP", () => {
    expect(xpForLevel(3)).toBe(200);
  });
  it("nivel 10 requiere 550 XP", () => {
    expect(xpForLevel(10)).toBe(550);
  });
  it("nivel 50 requiere 2550 XP", () => {
    expect(xpForLevel(50)).toBe(2550);
  });
  it("incremento constante de 50 por nivel", () => {
    const prev = xpForLevel(5);
    const next = xpForLevel(6);
    expect(next - prev).toBe(50);
  });
});

describe("applyXp sube de nivel correctamente", () => {
  const baseSkill: Skill = {
    id: "sailing",
    name: "Navegación",
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
  };

  it("gana XP sin subir de nivel", () => {
    const result = applyXp(baseSkill, 30);
    expect(result.level).toBe(1);
    expect(result.xp).toBe(30);
  });

  it("sube de nivel al alcanzar el umbral", () => {
    const result = applyXp(baseSkill, 100);
    expect(result.level).toBe(2);
    expect(result.xp).toBe(0);
    expect(result.xpToNext).toBe(xpForLevel(2));
  });

  it("acumula exceso de XP al subir varios niveles", () => {
    // Nivel 1: 100 para subir, nivel 2: 150 para subir. Total 250 XP debería llevar a nivel 3 con 0 XP restante.
    const result = applyXp(baseSkill, 250);
    expect(result.level).toBe(3);
    expect(result.xp).toBe(0);
    expect(result.xpToNext).toBe(xpForLevel(3));
  });

  it("no baja de nivel 1 nunca", () => {
    const result = applyXp({ ...baseSkill, level: 1, xp: 0 }, 0);
    expect(result.level).toBe(1);
  });
});
