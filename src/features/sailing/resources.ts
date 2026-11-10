export type ResourceId = "wood" | "iron" | "food" | "gold";

const RESOURCE_LABELS: Record<ResourceId, string> = {
  wood: "🪵 Madera",
  iron: "⚙️ Hierro",
  food: "🍖 Comida",
  gold: "🪙 Oro",
};

/** Devuelve "🪵 Madera" para un resource id, o el id crudo si es desconocido. */
export function resourceLabel(id: ResourceId | string): string {
  return RESOURCE_LABELS[id as ResourceId] ?? id;
}
