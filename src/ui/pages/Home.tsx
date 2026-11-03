import { useGameStore } from "../../core/store";
import Card from "../components/Card";

export default function Home() {
  const { currentIslandId } = useGameStore();
  const islandName = currentIslandId ? currentIslandId : "Tortuga";

  const locations = [
    { label: "Taberna", icon: "🍻", desc: "Recluta tripulación y gasta oro." },
    { label: "Puerto", icon: "⚓", desc: "Embarca hacia nuevas islas." },
    { label: "Mercado", icon: "🛒", desc: "Compra y vende recursos." },
    { label: "Mapa", icon: "🗺️", desc: "Planifica tu ruta." },
  ];

  return (
    <div className="p-6">
      <Card title={`${islandName} — Ciudad de Inicio`}>
        <p className="text-parchment mb-4">
          Bienvenido, Capitán. Aquí comienza tu historia pirata. Explora la taberna, el puerto y el mercado para avanzar.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {locations.map((loc) => (
            <Card key={loc.label} title={loc.label}>
              <p className="text-2xl">{loc.icon}</p>
              <p className="text-xs text-parchment">{loc.desc}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}