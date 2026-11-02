import { useEffect } from "react";
import { bootstrapGame } from "./bootstrap";
import { getGameState, useGameStore } from "./store";
import { saveGame } from "./saveLoad";
import { accumulateTicks } from "./tick";
import { AUTOSAVE_MS, OFFLINE_CAP_SECONDS, TICK_MS } from "./types";

/**
 * Runs the game clock: loads the save, ticks once per second and autosaves.
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
      state.tick(elapsedSeconds, now);
    }, TICK_MS);

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
