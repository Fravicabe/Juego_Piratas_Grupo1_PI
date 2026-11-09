import { useGameLoop } from "./useGameLoop";

/**
 * Headless component that keeps the game loop alive.
 */
export function GameLoop() {
  useGameLoop();
  return null;
}
