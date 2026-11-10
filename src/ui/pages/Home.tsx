import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../core/store";
import { gatherRateForResource } from "../../core/tick";
import { getIslandUnlockStatus } from "../../core/islands";
import { resourceLabel } from "../../features/sailing/resources";
import type { ResourceId } from "../../core/types";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

const SKILL_LABELS: Record<string, string> = {
  gathering: "Recolección",
  sailing: "Navegación",
  bargaining: "Negociación",
};

const SKILL_EFFECT_LABELS: Record<string, string> = {
  gathering: "recursos",
  sailing: "velocidad de viaje",
  bargaining: "oro",
};

export default function Home() {
  const navigate = useNavigate();
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const islands = useGameStore((s) => s.islands);
  const skills = useGameStore((s) => s.skills);
  const activeSkillId = useGameStore((s) => s.activeSkillId);
  const inventory = useGameStore((s) => s.inventory);
  const destinationIslandId = useGameStore((s) => s.destinationIslandId);

  const currentIsland = currentIslandId
    ? (islands[currentIslandId] ?? null)
    : null;
  const islandResources = currentIsland?.resources ?? [];
  const isGathering = Boolean(currentIsland) && !destinationIslandId;
  const unlockState = { islands, inventory, skills };

  const nextIsland = Object.values(islands).find((island) => !island.unlocked);
  const nextStatus = nextIsland
    ? getIslandUnlockStatus(unlockState, nextIsland.id)
    : null;
  const nextCost = Object.entries(nextIsland?.unlockCost ?? {}) as Array<
    [ResourceId, number]
  >;
  const missingText =
    nextStatus?.missingResources
      .map((resource) => `${Math.ceil(resource.missing)} ${resourceLabel(resource.id)}`)
      .join(", ") ?? "";
  const previousIsland = nextStatus?.requiresIslandId
    ? islands[nextStatus.requiresIslandId]
    : null;

  return (
    <div className="p-6 space-y-6">
      <Card
        title={`${currentIsland?.name ?? "Tortuga"} — Isla actual`}
      >
        <p className="text-parchment mb-4">
          {currentIsland?.description ??
            "Bienvenido, Capitán. Aquí comienza tu historia pirata."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
            <p className="text-sm opacity-80">Recursos de la isla</p>
            <p className="font-bold text-parchment">
              {islandResources.length > 0
                ? islandResources.map((resource) => resourceLabel(resource)).join(", ")
                : "Sin recursos"}
            </p>
          </div>
          <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
            <p className="text-sm opacity-80">Recolección</p>
            <p className="font-bold text-gold">
              {!islandResources.length
                ? "No disponible"
                : isGathering
                  ? "Activa (cada segundo)"
                  : "En pausa (navegando)"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(inventory) as ResourceId[]).map((resourceId) => (
            <div
              key={resourceId}
              className="bg-sea/20 rounded-lg p-3 border border-sea/30"
            >
              <p className="text-xs opacity-80">{resourceLabel(resourceId)}</p>
              <p className="font-bold text-gold text-lg">
                {Math.floor(inventory[resourceId])}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recolección automática (por segundo)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {islandResources.map((resource) => (
            <div
              key={resource}
              className="bg-sea/20 rounded-lg p-3 border border-sea/30 text-center"
            >
              <p className="text-xs opacity-80">{resourceLabel(resource)}</p>
              <p className="font-bold text-gold text-xl">
                {gatherRateForResource({ skills }, resource).toFixed(2)}{" "}
                <span className="text-xs opacity-70">/s</span>
              </p>
            </div>
          ))}
          {islandResources.length === 0 && (
            <div className="bg-sea/20 rounded-lg p-3 border border-sea/30 text-center col-span-full">
              <p className="text-xs opacity-70">
                No hay recursos que recolectar en esta isla.
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-parchment mt-3 opacity-80">
          {isGathering
            ? "La recolección se detiene mientras navegas. "
            : "Ahora mismo estás navegando, así que no se recolectan recursos. "}
          La tasa depende del nivel de Recolección
          {islandResources.includes("gold") ? " y del multiplicador de Negociación" : ""}.
        </p>
      </Card>

      <Card title="Habilidades y XP">
        <div className="space-y-3">
          {Object.values(skills).map((skill) => {
            const isActive = activeSkillId === skill.id;
            const effectPercent = Math.round(skill.effectPerLevel * 100);
            const effectLabel =
              SKILL_EFFECT_LABELS[skill.id] ?? skill.effectLabel;

            return (
              <div
                key={skill.id}
                className={`bg-sea/20 rounded-lg p-3 border ${
                  isActive ? "border-gold/60 bg-gold/5" : "border-sea/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-parchment">
                    {SKILL_LABELS[skill.id] ?? skill.name}
                  </span>
                  <span className="text-xs text-gold font-bold">
                    Nivel {skill.level}
                  </span>
                </div>
                <ProgressBar
                  current={skill.xp}
                  max={skill.xpToNext}
                  label={`${Math.floor(skill.xp)} / ${skill.xpToNext} XP`}
                />
                <p className="text-xs opacity-80 mt-1">
                  {isActive
                    ? `Entrenando ahora (+${skill.xpPerSecond} XP/s)`
                    : `Mejora: +${effectPercent}% ${effectLabel} por nivel`}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-parchment mt-3 opacity-80">
          Skill activo:{" "}
          {activeSkillId
            ? (SKILL_LABELS[activeSkillId] ?? skills[activeSkillId]?.name ?? activeSkillId)
            : "—"}
        </p>
      </Card>

      <Card title="Próximo desbloqueo">
        {nextIsland && nextStatus ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-parchment">{nextIsland.name}</p>
              <p className="text-xs text-gold">
                {nextIsland.resources.map((resource) => resourceLabel(resource)).join(", ")}
              </p>
            </div>

            {nextCost.length > 0 ? (
              <ul className="text-sm text-parchment space-y-1 mb-3">
                {nextCost.map(([resourceId, required]) => {
                  const have = Math.floor(inventory[resourceId] ?? 0);
                  const done = have >= required;
                  return (
                    <li key={resourceId} className={done ? "text-gold" : "opacity-80"}>
                      {done ? "✅" : "•"} {resourceLabel(resourceId)}: {have} / {required}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm opacity-80 mb-3">Todavía no hay forma de desbloquearla.</p>
            )}

            {!nextStatus.previousIslandUnlocked && previousIsland && (
              <p className="text-xs text-amber-400 mb-2">
                Primero desbloquea {previousIsland.name}.
              </p>
            )}
            {nextStatus.levelRequired && !nextStatus.levelRequirementMet && (
              <p className="text-xs text-amber-400 mb-2">
                Requiere Navegación nivel {nextStatus.levelRequired}.
              </p>
            )}
            {missingText && (
              <p className="text-xs text-amber-400 mb-2">
                Te falta: {missingText}.
              </p>
            )}
            {nextStatus.canUnlock && (
              <p className="text-xs text-gold mb-2">
                ¡Ya puedes desbloquearla desde el mapa!
              </p>
            )}
            <Button onClick={() => navigate("/map")}>🗺️ Ir al mapa</Button>
          </div>
        ) : (
          <p className="text-sm text-parchment">
            Todas las islas están desbloqueadas. ¡Buen trabajo, Capitán!
          </p>
        )}
      </Card>

      <Card title="Acciones rápidas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: "Mapa",
              icon: "🗺️",
              desc: "Desbloquea islas y navega",
              to: "/map",
            },
            {
              label: "Habilidades",
              icon: "📜",
              desc: "Consulta tu progreso",
              to: "/skills",
            },
            {
              label: "Recursos",
              icon: "📦",
              desc: "Revisa tu inventario",
              to: "/recursos",
            },
          ].map((action) => (
            <div
              key={action.label}
              className="bg-sea/20 rounded-lg p-3 border border-sea/30"
            >
              <Button onClick={() => navigate(action.to)}>
                {action.icon} {action.label}
              </Button>
              <p className="text-xs text-parchment mt-2">{action.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
