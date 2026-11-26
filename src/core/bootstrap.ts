import { createInitialState } from "./initialState";
import { loadGame } from "./saveLoad";
import { useGameStore } from "./store";
import { applyOfflineProgress } from "./tick";

// React StrictMode mounts effects twice in development. This flag makes sure
// offline progress is applied only once per page load.
let bootstrapped = false;

export function bootstrapGame(now = Date.now()): void {
  if (bootstrapped) return;
  bootstrapped = true;

  const saved = loadGame();

  if (saved) {
    useGameStore.getState().hydrate(applyOfflineProgress(saved, now));
    return;
  }

  useGameStore.getState().hydrate(createInitialState(now));
}
