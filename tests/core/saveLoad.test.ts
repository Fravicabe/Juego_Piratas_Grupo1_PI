import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../../src/core/initialState";
import { clearSave, loadGame, saveGame, SAVE_KEY } from "../../src/core/saveLoad";

describe("save/load", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips the game state", () => {
    const state = createInitialState(1234);
    state.inventory.wood = 42;
    state.skills.gathering.level = 3;

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

  it("clears the save", () => {
    saveGame(createInitialState(1234));
    clearSave();

    expect(loadGame()).toBeNull();
  });
});
