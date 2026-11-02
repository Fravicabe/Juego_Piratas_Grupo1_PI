import { describe, it, expect } from "vitest";
import { accumulateTicks } from "../../src/core/tick";

describe("accumulateTicks", () => {
  it("returns elapsed seconds", () => {
    const r = accumulateTicks(0, 5000, 1000);
    expect(r.elapsedSeconds).toBe(5);
  });
  it("caps at capSeconds", () => {
    const r = accumulateTicks(0, 100000 * 1000, 1000);
    expect(r.elapsedSeconds).toBe(1000);
  });
  it("never negative", () => {
    const r = accumulateTicks(5000, 0, 1000);
    expect(r.elapsedSeconds).toBe(0);
  });
});
