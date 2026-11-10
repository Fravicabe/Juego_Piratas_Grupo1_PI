import { useGameStore } from "../../core/store";
import { formatEta } from "../../features/sailing/eta";
import Button from "../components/Button";
import ResourceBar from "../components/ResourceBar";
import islandsJson from "../../data/islands.json";
import type { ResourceId } from "../../core/types";

interface IslandData {
  id: string;
  name: string;
  description: string;
  resources: ResourceId[];
  travelTimeBase: number;
  unlocked: boolean;
  lockedUntilLevel?: number;
  unlockCost?: Partial<Record<ResourceId, number>>;
}

const RESOURCE_LABELS: Record<ResourceId, string> = {
  wood: "Madera",
  iron: "Hierro",
  food: "Comida",
  gold: "Oro",
};

const ISLANDS: Record<string, IslandData> = {};
for (const island of islandsJson as IslandData[]) {
  ISLANDS[island.id] = island;
}

export default function Map() {
  const islands = useGameStore((s) => s.islands);
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const destinationIslandId = useGameStore((s) => s.destinationIslandId);
  const travelEta = useGameStore((s) => s.travelEta);
  const discoveredIslands = useGameStore((s) => s.discoveredIslands);
  const sailingLevel = useGameStore((s) => s.skills.sailing.level);
  const shipSpeed = useGameStore((s) => s.ship.speed);
  const inventory = useGameStore((s) => s.inventory);
  const setDestination = useGameStore((s) => s.setDestination);
  const unlockIsland = useGameStore((s) => s.unlockIsland);

  const isTraveling = destinationIslandId !== null;

  const handleSail = (islandId: string) => {
    const island = ISLANDS[islandId];
    if (
      !island.unlocked ||
      (island.lockedUntilLevel && sailingLevel < island.lockedUntilLevel) ||
      islandId === currentIslandId ||
      isTraveling ||
      !discoveredIslands.includes(islandId)
    ) {
      return;
    }
    setDestination(islandId);
  };

  const handleUnlock = (islandId: string) => {
    unlockIsland(islandId);
  };

  const canAfford = (island: IslandData) => {
    if (!island.unlockCost) return false;
    return Object.entries(island.unlockCost).every(
      ([resourceId, amount]) =>
        (inventory[resourceId as ResourceId] ?? 0) >= amount
    );
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
                {ISLANDS[destinationIslandId]?.name ?? destinationIslandId}
              </span>
            </p>
            <div className="text-2xl font-mono text-gold">{formatEta(travelEta)}</div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-parchment text-lg font-semibold mb-3">Islas disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(islands).map((island) => {
              const isCurrent = island.id === currentIslandId;
              const discovered = discoveredIslands.includes(island.id);
              const lockedByLevel =
                island.lockedUntilLevel && sailingLevel < island.lockedUntilLevel;
              const lockedByCost =
                island.unlockCost && !island.unlocked && !lockedByLevel;
              const afford = lockedByCost ? canAfford(island) : false;

              let label = "Zarpar";
              let reason = "";
              let showUnlock = false;
              if (isCurrent) label = "Estás aquí";
              else if (isTraveling) label = "En viaje...";
              else if (!discovered) label = "Sin descubrir";
              else if (lockedByLevel) {
                label = "Bloqueada";
                reason = `Requiere Navegación nivel ${island.lockedUntilLevel}`;
              } else if (lockedByCost) {
                showUnlock = true;
                label = "Desbloquear";
                const costText = Object.entries(island.unlockCost!)
                  .map(([r, a]) => {
                    const rid = r as ResourceId;
                    return `${RESOURCE_LABELS[rid] ?? r} ×${a}`;
                  })
                  .join(" + ");
                reason = `Costo: ${costText}`;
                if (!afford) reason += " — insuficiente";
              }

              const cardClass = isCurrent
                ? "bg-gold/10 border-gold/30"
                : "bg-sea/10 border-sea/30";

              return (
                <div
                  key={island.id}
                  className={`border-2 rounded-lg p-4 ${cardClass}`}
                >
                  <h3 className="text-gold font-bold mb-2">{island.name}</h3>
                  <p className="text-sm opacity-80 mb-3">{island.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-parchment">
                      Distancia: {island.travelTimeBase}s
                    </span>
                    <span className="text-xs text-gold">
                      Velocidad barco: {shipSpeed}x
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {island.resources.map((r) => (
                      <span
                        key={r}
                        className="text-xs bg-sea/40 text-parchment px-2 py-1 rounded"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  {!discovered && (
                    <p className="text-xs text-red-400 mb-3">
                      Isla sin descubrir
                    </p>
                  )}
                  {lockedByLevel && (
                    <p className="text-xs text-amber-400 mb-3">{reason}</p>
                  )}
                  {showUnlock && (
                    <>
                      <p className="text-xs text-amber-400 mb-2">{reason}</p>
                      <Button onClick={() => handleUnlock(island.id)}>
                        {label}
                      </Button>
                      {!afford && (
                        <p className="text-xs text-amber-400 mt-1">
                          Recursos insuficientes
                        </p>
                      )}
                    </>
                  )}
                  {!showUnlock &&
                    !lockedByLevel &&
                    !isCurrent &&
                    !isTraveling && (
                      <Button
                        onClick={() => handleSail(island.id)}
                      >
                        {label}
                      </Button>
                    )}
                  {reason &&
                    !showUnlock &&
                    !lockedByLevel &&
                    !isCurrent &&
                    !isTraveling && (
                      <p className="text-xs text-amber-400 mt-2">{reason}</p>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-parchment text-lg font-semibold mb-3">Recursos</h2>
          <div className="flex gap-6">
            {Object.entries(inventory).map(([id, amount]) => (
              <ResourceBar
                key={id}
                id={id}
                amount={amount}
                label={RESOURCE_LABELS[id as ResourceId] ?? id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
