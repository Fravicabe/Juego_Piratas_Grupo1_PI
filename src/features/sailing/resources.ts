import type { ResourceId } from "../../core/types";

export type { ResourceId } from "../../core/types";

const RESOURCE_NAMES: Record<ResourceId, string> = {
  wood: "Madera",
  iron: "Hierro",
  food: "Comida",
  gold: "Oro",
};

const RESOURCE_ICONS: Record<ResourceId, string> = {
  wood: "🪵",
  iron: "⚙️",
  food: "🍖",
  gold: "🪙",
};

/** Devuelve "Madera" para un resource id, o el id crudo si es desconocido. */
export function resourceName(id: ResourceId | string): string {
  return RESOURCE_NAMES[id as ResourceId] ?? id;
}

/** Devuelve "🪵 Madera" para un resource id, o el id crudo si es desconocido. */
export function resourceLabel(id: ResourceId | string): string {
  const name = resourceName(id);
  if (name === id) return id;
  return `${RESOURCE_ICONS[id as ResourceId]} ${name}`;
}
