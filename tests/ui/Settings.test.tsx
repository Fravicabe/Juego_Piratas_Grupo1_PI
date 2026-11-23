import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";
import Settings from "../../src/ui/pages/Settings";

describe("Settings", () => {
  beforeEach(() => {
    useGameStore.getState().hydrate(createInitialState(0));
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "unset";
  });

  it("summarises the current run", () => {
    render(<Settings />);

    expect(screen.getByRole("heading", { name: "Ajustes" })).toBeTruthy();
    expect(screen.getByText("Cabin Boy")).toBeTruthy();
    expect(screen.getByText("Tortuga")).toBeTruthy();
    expect(screen.getByText(/Tiempo jugado: 0 min/)).toBeTruthy();
  });

  it("asks for confirmation before resetting the game", () => {
    const state = createInitialState(0);
    state.inventory.wood = 40;
    useGameStore.getState().hydrate(state);

    render(<Settings />);

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar partida" }));
    expect(screen.getByRole("dialog", { name: "¿Reiniciar partida?" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useGameStore.getState().inventory.wood).toBe(40);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar partida" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, reiniciar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useGameStore.getState().inventory.wood).toBe(0);
    expect(useGameStore.getState().islands.nassau.unlocked).toBe(false);
  });
});
