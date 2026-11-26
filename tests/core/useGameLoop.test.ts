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

  it("trains skills on the fast tick and updates travel on the 1s tick", () => {
    const { unmount } = renderHook(() => useGameLoop());

    vi.advanceTimersByTime(50);
    const fast = useGameStore.getState();
    expect(fast.skills.gathering.xp).toBeGreaterThan(0);
    expect(fast.inventory.wood).toBe(0);

    vi.advanceTimersByTime(950);
    const docked = useGameStore.getState();
    expect(docked.skills.gathering.xp).toBeGreaterThan(0);
    expect(docked.inventory.wood).toBeGreaterThan(0);

    // Give wood and unlock Nassau (costs 30 wood), then sail there
    const currentState = useGameStore.getState();
    useGameStore.getState().hydrate({
      ...currentState,
      inventory: { ...currentState.inventory, wood: 30 },
    });
    useGameStore.getState().unlockIsland("nassau");
    useGameStore.getState().setDestination("nassau");
    vi.advanceTimersByTime(1000);

    const travelling = useGameStore.getState();
    expect(travelling.travelEta).toBe(59);
    expect(travelling.skills.sailing.xp).toBeGreaterThan(0);
    expect(travelling.totalPlaytime).toBeCloseTo(2);

    unmount();
  });
});
