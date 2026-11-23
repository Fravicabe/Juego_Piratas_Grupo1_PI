import { useGameStore } from "../../core/store";
import { getIslandUnlockStatus } from "../../core/islands";
import { skillEffect } from "../../core/skills";
import { canSailTo, formatEta } from "../../features/sailing/eta";
import { resourceLabel, resourceName } from "../../features/sailing/resources";
import type { ResourceId } from "../../core/types";
import Button from "../components/Button";
import ResourceBar from "../components/ResourceBar";

export default function Map() {
  const islands = useGameStore((s) => s.islands);
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const destinationIslandId = useGameStore((s) => s.destinationIslandId);
  const travelEta = useGameStore((s) => s.travelEta);
  const discoveredIslands = useGameStore((s) => s.discoveredIslands);
  const sailingLevel = useGameStore((s) => s.skills.sailing.level);
  const skills = useGameStore((s) => s.skills);
  const shipSpeed = useGameStore((s) => s.ship.speed);
  const inventory = useGameStore((s) => s.inventory);
  const setDestination = useGameStore((s) => s.setDestination);
  const unlockIsland = useGameStore((s) => s.unlockIsland);

  const isTraveling = destinationIslandId !== null;
  const unlockState = { islands, inventory, skills };
  const currentIsland = currentIslandId ? islands[currentIslandId] : null;
  const effectiveSpeed = Math.max(0.1, shipSpeed * skillEffect(skills.sailing));

  const handleSail = (islandId: string) => {
    const island = islands[islandId];
    if (!island) return;

    const discovered = discoveredIslands.includes(islandId);
    if (
      !canSailTo(
        island,
        currentIslandId,
        isTraveling,
        discovered,
        sailingLevel,
      )
    ) {
      return;
    }

    setDestination(islandId);
  };

  const handleUnlock = (islandId: string) => {
    unlockIsland(islandId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-wood/10">
      <div className="p-6">
        <h1 className="text-gold text-2xl font-bold mb-6">🗺️ Mapa</h1>

        {isTraveling && (
          <div className="bg-sea/20 border-2 border-gold/30 rounded-lg p-4 mb-6">
            <h3 className="text-gold font-bold mb-2">En viaje…</h3>
            <p className="text-parchment mb-2">
              Navegando hacia{" "}
              <span className="font-bold text-gold">
                {islands[destinationIslandId]?.name ?? destinationIslandId}
              </span>
            </p>
            <div className="text-2xl font-mono text-gold">{formatEta(travelEta)}</div>
            <p className="text-xs text-parchment mt-2 opacity-80">
              Mientras navegas no se recolectan recursos.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-parchment text-lg font-semibold mb-3">Recursos</h2>
          <div className="flex flex-wrap gap-x-6">
            {(Object.keys(inventory) as ResourceId[]).map((resourceId) => (
              <ResourceBar
                key={resourceId}
                id={resourceId}
                amount={inventory[resourceId]}
                label={resourceName(resourceId)}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-parchment text-lg font-semibold mb-3">
            Islas disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(islands).map((island) => {
              const isCurrent = island.id === currentIslandId;
              const discovered = discoveredIslands.includes(island.id);
              const status = getIslandUnlockStatus(unlockState, island.id);
              const needsUnlock = !island.unlocked && status.hasCost;
              const canSail = canSailTo(
                island,
                currentIslandId,
                isTraveling,
                discovered,
                sailingLevel,
              );
              const previousIsland = status.requiresIslandId
                ? islands[status.requiresIslandId]
                : null;
              const missingText = status.missingResources
                .map(
                  (resource) =>
                    `${Math.ceil(resource.missing)} ${resourceLabel(resource.id)}`,
                )
                .join(", ");
              const costEntries = Object.entries(island.unlockCost ?? {}) as Array<
                [ResourceId, number]
              >;
              const travelSeconds =
                Math.abs(
                  island.travelTimeBase -
                    (currentIsland?.travelTimeBase ?? 0),
                ) / effectiveSpeed;

              const cardClass = isCurrent
                ? "bg-gold/10 border-gold/30"
                : "bg-sea/10 border-sea/30";

              return (
                <div
                  key={island.id}
                  className={`border-2 rounded-lg p-4 ${cardClass}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-gold font-bold">{island.name}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                        📍 Estás aquí
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mb-3">{island.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-parchment">
                      Viaje: {formatEta(travelSeconds)}
                    </span>
                    <span className="text-xs text-gold">
                      Velocidad: {effectiveSpeed.toFixed(2)}x
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {island.resources.map((resource) => (
                      <span
                        key={resource}
                        className="text-xs bg-sea/40 text-parchment px-2 py-1 rounded"
                      >
                        {resourceLabel(resource)}
                      </span>
                    ))}
                  </div>

                  {isCurrent && (
                    <p className="text-xs text-parchment opacity-80">
                      {isTraveling
                        ? "Zarpando desde aquí..."
                        : "Recolectando recursos automáticamente."}
                    </p>
                  )}

                  {!isCurrent && needsUnlock && (
                    <div>
                      <p className="text-sm font-bold text-gold mb-1">
                        Desbloqueo
                      </p>
                      <ul className="text-xs text-parchment space-y-1 mb-2">
                        {costEntries.map(([resourceId, required]) => {
                          const have = Math.floor(inventory[resourceId] ?? 0);
                          const done = have >= required;
                          return (
                            <li
                              key={resourceId}
                              className={done ? "text-gold" : "opacity-80"}
                            >
                              {done ? "✅" : "•"} {resourceLabel(resourceId)}:{" "}
                              {have} / {required}
                            </li>
                          );
                        })}
                      </ul>

                      {!status.previousIslandUnlocked && previousIsland && (
                        <p className="text-xs text-amber-400 mb-2">
                          Primero desbloquea {previousIsland.name}.
                        </p>
                      )}
                      {status.levelRequired && !status.levelRequirementMet && (
                        <p className="text-xs text-amber-400 mb-2">
                          Requiere Navegación nivel {status.levelRequired} (tienes{" "}
                          {sailingLevel}).
                        </p>
                      )}
                      {missingText && (
                        <p className="text-xs text-amber-400 mb-2">
                          Te falta: {missingText}.
                        </p>
                      )}
                      {status.canUnlock && (
                        <p className="text-xs text-gold mb-2">
                          Listo para desbloquear.
                        </p>
                      )}

                      <Button
                        disabled={!status.canUnlock}
                        ariaLabel={`Desbloquear ${island.name}`}
                        onClick={() => handleUnlock(island.id)}
                      >
                        🔓 Desbloquear
                      </Button>
                    </div>
                  )}

                  {!isCurrent && !needsUnlock && !island.unlocked && (
                    <p className="text-xs text-amber-400">
                      Todavía no hay forma de desbloquear esta isla.
                    </p>
                  )}

                  {!isCurrent && island.unlocked && (
                    <div>
                      {status.levelRequired && !status.levelRequirementMet && (
                        <p className="text-xs text-amber-400 mb-2">
                          Requiere Navegación nivel {status.levelRequired} (tienes{" "}
                          {sailingLevel}).
                        </p>
                      )}
                      {!discovered && (
                        <p className="text-xs text-amber-400 mb-2">
                          Isla sin descubrir.
                        </p>
                      )}
                      <Button
                        disabled={!canSail}
                        ariaLabel={`Zarpar a ${island.name}`}
                        onClick={() => handleSail(island.id)}
                      >
                        {isTraveling ? "En viaje..." : "⛵ Zarpar"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
