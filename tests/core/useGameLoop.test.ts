import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../src/core/store";
import { useGameLoop } from "../../src/core/useGameLoop";

describe("useGameLoop", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("trains skills and updates travel on ticks", () => {
    const { unmount } = renderHook(() => useGameLoop());

    // Primer tick: 1000ms
    vi.advanceTimersByTime(1000);
    const afterFirstTick = useGameStore.getState();
    expect(afterFirstTick.skills.gathering.xp).toBeGreaterThan(0);
    expect(afterFirstTick.inventory.wood).toBeGreaterThan(0);
    expect(afterFirstTick.totalPlaytime).toBe(1);

    // Segundo tick: otros 1000ms
    vi.advanceTimersByTime(1000);
    const afterSecondTick = useGameStore.getState();
    expect(afterSecondTick.totalPlaytime).toBe(2);

    // Iniciar viaje a Nassau
    useGameStore.getState().setDestination("nassau");
    vi.advanceTimersByTime(1000);

    const travelling = useGameStore.getState();
    expect(travelling.travelEta).toBe(59);
    expect(travelling.skills.sailing.xp).toBeGreaterThan(0);
    expect(travelling.totalPlaytime).toBe(3);

    unmount();
  });
});
