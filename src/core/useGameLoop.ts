import { useEffect } from "react";
import { bootstrapGame } from "./bootstrap";
import { getGameState, useGameStore } from "./store";
import { saveGame } from "./saveLoad";
import { accumulateTicks } from "./tick";
import { AUTOSAVE_MS, LOOP_TICK_MS, OFFLINE_CAP_SECONDS } from "./types";

/**
 * Runs the game clock.
 *
 * One 50ms loop drives both rates:
 * - the whole delta trains the active skill (fast, smooth XP bar);
 * - `advanceGame` accumulates it and runs travel/gathering on exact 1s ticks.
 *
 * Mount it once, for example through <GameLoop /> in main.tsx.
 */
export function useGameLoop(): void {
  useEffect(() => {
    bootstrapGame();

    const tickId = window.setInterval(() => {
      const state = useGameStore.getState();
      const now = Date.now();
      const { elapsedSeconds } = accumulateTicks(
        state.lastTick,
        now,
        OFFLINE_CAP_SECONDS,
      );

      if (elapsedSeconds > 0) {
        state.tick(elapsedSeconds, now);
      }
    }, LOOP_TICK_MS);

    const saveNow = () => saveGame(getGameState());
    const saveId = window.setInterval(saveNow, AUTOSAVE_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveNow();
    };

    window.addEventListener("beforeunload", saveNow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(saveId);
      window.removeEventListener("beforeunload", saveNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      saveNow();
    };
  }, []);
}
