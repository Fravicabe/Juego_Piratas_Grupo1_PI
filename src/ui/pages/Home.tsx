import { useGameStore } from "../../core/store";
import ResourceBar from "../components/ResourceBar";
import ProgressBar from "../components/ProgressBar";
import Card from "../components/Card";

export default function Home() {
  const { inventory, skills } = useGameStore();

  return (
    <div className="p-6">
      <Card title="Bienvenido, Capitán">
        <p className="text-parchment">
          Bienvenido a tu aventura pirata. Navega entre islas, recolecta recursos y sube de nivel.
        </p>
        <Card>
          <ResourceBar id="wood" amount={inventory.wood} label="Madera" />
          <ResourceBar id="iron" amount={inventory.iron} label="Hierro" />
          <ResourceBar id="food" amount={inventory.food} label="Comida" />
          <ResourceBar id="gold" amount={inventory.gold} label="Oro" />
        </Card>
        <Card>
          <ProgressBar current={skills.gathering?.xp ?? 0} max={10} label="XP de Recolección" />
        </Card>
      </Card>
    </div>
  );
}