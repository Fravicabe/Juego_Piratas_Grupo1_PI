import { useGameStore } from "../../core/store";
import { gatherRateForResource } from "../../core/tick";
import { resourceLabel, resourceName } from "../../features/sailing/resources";
import type { ResourceId } from "../../core/types";
import ResourceBar from "../components/ResourceBar";
import Card from "../components/Card";

export default function Recursos() {
  const inventory = useGameStore((s) => s.inventory);
  const skills = useGameStore((s) => s.skills);
  const islands = useGameStore((s) => s.islands);
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const destinationIslandId = useGameStore((s) => s.destinationIslandId);

  const currentIsland = currentIslandId
    ? (islands[currentIslandId] ?? null)
    : null;
  const resources = Object.keys(inventory) as ResourceId[];
  const isGathering = Boolean(currentIsland) && !destinationIslandId;

  return (
    <div className="p-6 space-y-6">
      <Card title="Inventario">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {resources.map((resourceId) => (
            <ResourceBar
              key={resourceId}
              id={resourceId}
              amount={inventory[resourceId]}
              label={resourceName(resourceId)}
            />
          ))}
        </div>
      </Card>

      <Card title="Producción actual">
        {currentIsland && isGathering ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentIsland.resources.map((resourceId) => (
              <div
                key={resourceId}
                className="bg-sea/20 rounded-lg p-3 border border-sea/30 text-center"
              >
                <p className="text-xs opacity-80">
                  {resourceLabel(resourceId)}
                </p>
                <p className="font-bold text-gold text-xl">
                  {gatherRateForResource({ skills }, resourceId).toFixed(2)}{" "}
                  <span className="text-xs opacity-70">/s</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-parchment opacity-80">
            {destinationIslandId
              ? "Estás navegando: la recolección está en pausa."
              : "No hay recursos que recolectar en esta isla."}
          </p>
        )}
      </Card>
    </div>
  );
}
