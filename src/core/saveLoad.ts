import type { GameState } from "./types";
import { SCHEMA_VERSION } from "./types";

export const SAVE_KEY = "pirate-idle-save";

export function saveGame(state: GameState): void {
  try {
    const payload = JSON.stringify({ ...state, version: SCHEMA_VERSION });
    localStorage.setItem(SAVE_KEY, payload);
  } catch {
    // Storage can be unavailable or full; ignore so the game keeps running.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const save = parsed as Partial<GameState>;
    if (save.version !== SCHEMA_VERSION) return null;
    if (!save.player || !save.ship || !save.inventory || !save.skills || !save.islands) {
      return null;
    }

    return save as GameState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Storage can be unavailable; there is nothing to clear.
  }
}
