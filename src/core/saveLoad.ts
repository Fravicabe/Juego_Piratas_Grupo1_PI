import type { GameState } from "./types";
import { SCHEMA_VERSION } from "./types";

const KEY = "pirate-idle-save";

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, version: SCHEMA_VERSION }));
  } catch {
    /* ignore quota errors */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SCHEMA_VERSION) return null; // migration hook point
    return parsed;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(KEY);
}
