import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createInitialState } from "../../src/core/initialState";
import { useGameStore } from "../../src/core/store";
import Map from "../../src/ui/pages/Map";

function renderMap() {
  return render(
    <MemoryRouter>
      <Map />
    </MemoryRouter>,
  );
}

describe("Map", () => {
  beforeEach(() => {
    useGameStore.getState().hydrate(createInitialState(0));
  });

  afterEach(() => {
    cleanup();
  });

  it("disables the unlock button and explains the missing resources", () => {
    const state = createInitialState(0);
    state.inventory.wood = 10;
    useGameStore.getState().hydrate(state);

    renderMap();

    const unlockButton = screen.getByRole("button", {
      name: "Desbloquear Nassau",
    }) as HTMLButtonElement;

    expect(unlockButton.disabled).toBe(true);
    expect(screen.getByText(/Te falta: 20 .*Madera/)).toBeTruthy();
  });

  it("unlocks Nassau and then starts the trip there", () => {
    const state = createInitialState(0);
    state.inventory.wood = 30;
    useGameStore.getState().hydrate(state);

    renderMap();

    fireEvent.click(
      screen.getByRole("button", { name: "Desbloquear Nassau" }),
    );

    expect(useGameStore.getState().islands.nassau.unlocked).toBe(true);
    expect(useGameStore.getState().inventory.wood).toBe(0);

    const sailButton = screen.getByRole("button", {
      name: "Zarpar a Nassau",
    }) as HTMLButtonElement;
    expect(sailButton.disabled).toBe(false);

    fireEvent.click(sailButton);

    expect(useGameStore.getState().destinationIslandId).toBe("nassau");
    expect(useGameStore.getState().travelEta).toBe(60);
  });

  it("requires Nassau to be unlocked before Skull Isle", () => {
    const state = createInitialState(0);
    state.inventory.wood = 100;
    state.inventory.iron = 100;
    useGameStore.getState().hydrate(state);

    renderMap();

    const unlockButton = screen.getByRole("button", {
      name: "Desbloquear Skull Isle",
    }) as HTMLButtonElement;

    expect(unlockButton.disabled).toBe(true);
    expect(screen.getByText("Primero desbloquea Nassau.")).toBeTruthy();
  });
});
