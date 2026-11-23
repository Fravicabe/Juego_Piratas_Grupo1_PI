import { describe, expect, it } from "vitest";
import { validateData } from "../../scripts/validate-data.mjs";

describe("game data files", () => {
  it("pass schema and cross-file validation", () => {
    const result = validateData();

    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
