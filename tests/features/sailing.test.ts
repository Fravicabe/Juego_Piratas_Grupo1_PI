import { describe, it, expect } from "vitest";
import { formatEta, canSailTo } from "../../src/features/sailing/eta";

describe("formatEta", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatEta(0)).toBe("00:00");
    expect(formatEta(5)).toBe("00:05");
    expect(formatEta(60)).toBe("01:00");
    expect(formatEta(65)).toBe("01:05");
    expect(formatEta(3600)).toBe("60:00");
  });

  it("rounds fractional seconds up", () => {
    expect(formatEta(0.2)).toBe("00:01");
    expect(formatEta(59.2)).toBe("01:00");
  });

  it("never returns negative values", () => {
    expect(formatEta(-10)).toBe("00:00");
  });
});

describe("canSailTo", () => {
  const nassau = { id: "nassau", unlocked: true };
  const skullIsle = { id: "skull_isle", unlocked: false, lockedUntilLevel: 10 };
  const skullIsleUnlocked = {
    id: "skull_isle",
    unlocked: true,
    lockedUntilLevel: 10,
  };

  it("allows sailing to an unlocked, discovered island that is not current", () => {
    expect(canSailTo(nassau, "tortuga", false, true, 1)).toBe(true);
  });

  it("blocks sailing while a trip is already in progress", () => {
    expect(canSailTo(nassau, "tortuga", true, true, 1)).toBe(false);
  });

  it("blocks sailing to the island the ship is already at", () => {
    expect(canSailTo(nassau, "nassau", false, true, 1)).toBe(false);
  });

  it("blocks undiscovered islands", () => {
    expect(canSailTo(nassau, "tortuga", false, false, 1)).toBe(false);
  });

  it("blocks islands locked by level when sailing level is too low", () => {
    expect(canSailTo(skullIsleUnlocked, "tortuga", false, true, 1)).toBe(false);
    expect(canSailTo(skullIsleUnlocked, "tortuga", false, true, 9)).toBe(false);
  });

  it("allows islands locked by level when sailing level is sufficient", () => {
    expect(canSailTo(skullIsleUnlocked, "tortuga", false, true, 10)).toBe(true);
    expect(canSailTo(skullIsleUnlocked, "tortuga", false, true, 99)).toBe(true);
  });

  it("blocks locked islands regardless of level", () => {
    expect(canSailTo(skullIsle, "tortuga", false, true, 99)).toBe(false);
  });
});
