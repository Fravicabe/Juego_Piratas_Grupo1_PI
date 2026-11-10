import { useGameStore } from "../../core/store";
import { gatherRate } from "../../core/tick";
import { resourceLabel } from "../../features/sailing/resources";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

const SKILL_ORDER = ["gathering", "sailing", "bargaining"] as const;

const RESOURCE_LABELS: Record<string, string> = {
  wood: "Madera",
  iron: "Hierro",
  food: "Comida",
  gold: "Oro",
};

export default function Home() {
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const islands = useGameStore((s) => s.islands);
  const discoveredIslands = useGameStore((s) => s.discoveredIslands);
  const skills = useGameStore((s) => s.skills);
  const activeSkillId = useGameStore((s) => s.activeSkillId);

  const currentIsland =
    currentIslandId && islands[currentIslandId]
      ? islands[currentIslandId]
      : null;
  const discovered = currentIslandId
    ? discoveredIslands.includes(currentIslandId)
    : false;

  const gathering = skills.gathering;

  // Tasa de recolección por segundo según nivel de gathering
  const yieldPerSecond = gathering
    ? gatherRate(gathering.level, gathering.effectPerLevel)
    : 1;

  return (
    <div className="p-6">
      <Card title={`${currentIsland?.name ?? "Tortuga"} — Ciudad de Inicio`}>
        <p className="text-parchment mb-4">
          Bienvenido, Capitán. Aquí comienza tu historia pirata. Explora la taberna, el puerto y el mercado para avanzar.
        </p>

        {/* Isla actual y recursos descubiertos */}
        <div className="mb-6">
          <h3 className="text-gold font-bold mb-2">Isla actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
              <p className="text-sm opacity-80">Nombre</p>
              <p className="font-bold text-parchment">
                {currentIsland?.name ?? "—"}
              </p>
            </div>
            <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
              <p className="text-sm opacity-80">Estado</p>
              <p className={`font-bold ${discovered ? "text-gold" : "text-amber-400"}`}>
                {discovered ? "Descubierta" : "Sin descubrir"}
              </p>
            </div>
          </div>
          {currentIsland && discovered && (
            <div className="mt-3">
              <p className="text-sm opacity-80 mb-1">Recursos disponibles:</p>
              <div className="flex gap-2">
                {currentIsland.resources.map((r) => (
                  <span
                    key={r}
                    className="text-xs bg-sea/40 text-parchment px-2 py-1 rounded"
                  >
                    {resourceLabel(r)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasa de recolección */}
        <div className="mb-6">
          <h3 className="text-gold font-bold mb-2">Recolección (por segundo)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {currentIsland?.resources.map((r) => (
              <div
                key={r}
                className="bg-sea/20 rounded-lg p-3 border border-sea/30 text-center"
              >
                <p className="text-xs opacity-80">{RESOURCE_LABELS[r] ?? r}</p>
                <p className="font-bold text-gold text-xl">
                  {yieldPerSecond.toFixed(2)}{" "}
                  <span className="text-xs opacity-70">/s</span>
                </p>
              </div>
            ))}
            {!currentIsland?.resources.length && (
              <div className="bg-sea/20 rounded-lg p-3 border border-sea/30 text-center col-span-full">
                <p className="text-xs opacity-70">
                  No hay recursos que recolectar en esta isla.
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-parchment mt-2 opacity-80">
            La tasa depende de tu nivel de {gathering?.name ?? "Recolección"}.
            Nivel actual:{gathering?.level ?? 1}
          </p>
        </div>

        {/* Habilidades */}
        <div className="mb-6">
          <h3 className="text-gold font-bold mb-2">Habilidades</h3>
          <div className="space-y-3">
            {SKILL_ORDER.map((skillId) => {
              const skill = skills[skillId];
              if (!skill) return null;
              const isActive = activeSkillId === skillId;
              return (
                <div
                  key={skillId}
                  className={`bg-sea/20 rounded-lg p-3 border border-sea/30 ${
                    isActive ? "border-gold/50 bg-gold/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-parchment">
                      {skill.name}
                    </span>
                    <span className="text-xs text-gold font-bold">
                      Nivel {skill.level}
                    </span>
                  </div>
                  <ProgressBar
                    current={skill.xp}
                    max={skill.xpToNext}
                    label={`${skill.xp} / ${skill.xpToNext} XP`}
                  />
                  <p className="text-xs opacity-80 mt-1">
                    {isActive ? "Entrenando ahora" : skill.effectLabel}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-parchment mt-2 opacity-80">
            Skill activo:{activeSkillId ? skills[activeSkillId]?.name ?? activeSkillId : "—"}
          </p>
        </div>

        {/* Botones de acción rápidas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "Taberna", icon: "🍻", desc: "Recluta tripulación" },
            { label: "Puerto", icon: "⚓", desc: "Embarca hacia nuevas islas" },
            { label: "Mercado", icon: "🛒", desc: "Compra y vende recursos" },
            { label: "Mapa", icon: "🗺️", desc: "Planifica tu ruta" },
          ].map((loc) => (
            <Card key={loc.label}>
              <Button onClick={() => {}}>
                {loc.icon} {loc.label}
              </Button>
              <p className="text-xs text-parchment mt-1">{loc.desc}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
