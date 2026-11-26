import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";
import Topbar from "../../src/ui/components/Topbar";

describe("Topbar", () => {
  beforeEach(() => {
    useGameStore.getState().hydrate(createInitialState(0));
  });

  afterEach(() => {
    cleanup();
  });

  it("reads gold and rank from the store", () => {
    render(<Topbar />);

    expect(screen.getByText(/Oro: 0/)).toBeTruthy();
    expect(screen.getByText("Rango: Cabin Boy")).toBeTruthy();
  });

  it("updates in real time when the store changes", () => {
    render(<Topbar />);

    act(() => {
      const state = createInitialState(0);
      state.inventory.gold = 250;
      state.player.rank = "Deckhand";
      useGameStore.getState().hydrate(state);
    });

    expect(screen.getByText(/Oro: 250/)).toBeTruthy();
    expect(screen.getByText("Rango: Deckhand")).toBeTruthy();
  });
});
