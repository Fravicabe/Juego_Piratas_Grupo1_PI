import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";
import Home from "../../src/ui/pages/Home";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  beforeEach(() => {
    useGameStore.getState().hydrate(createInitialState(0));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the current island, gathering rate and skill XP", () => {
    renderHome();

    expect(screen.getByText("Tortuga — Isla actual")).toBeTruthy();
    expect(screen.getByText("Recolección automática (por segundo)")).toBeTruthy();
    expect(screen.getByText(/1\.00/)).toBeTruthy();
    expect(screen.getAllByText("Nivel 1")).toHaveLength(3);
    expect(screen.getByText(/Entrenando ahora \(\+3 XP\/s\)/)).toBeTruthy();
  });

  it("shows how many resources are still missing for the next island", () => {
    const state = createInitialState(0);
    state.inventory.wood = 10;
    useGameStore.getState().hydrate(state);

    renderHome();

    expect(screen.getByText(/Madera: 10 \/ 30/)).toBeTruthy();
    expect(screen.getByText(/Te falta: 20 .*Madera/)).toBeTruthy();
  });

  it("includes the bargaining multiplier in the gold rate", () => {
    const state = createInitialState(0);
    state.currentIslandId = "skull_isle";
    state.islands.nassau.unlocked = true;
    state.islands.skull_isle.unlocked = true;
    state.discoveredIslands = ["tortuga", "nassau", "skull_isle"];
    state.skills.bargaining.level = 2;
    useGameStore.getState().hydrate(state);

    renderHome();

    expect(screen.getByText(/1\.03/)).toBeTruthy();
  });

  it("shows gathering as paused while the ship is travelling", () => {
    const state = createInitialState(0);
    state.destinationIslandId = "nassau";
    state.travelEta = 30;
    useGameStore.getState().hydrate(state);

    renderHome();

    expect(screen.getByText("En pausa (navegando)")).toBeTruthy();
  });
});
