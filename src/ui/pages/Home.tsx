import { useGameStore } from "../../core/store";
import ResourceBar from "../components/ResourceBar";
import ProgressBar from "../components/ProgressBar";
import Card from "../components/Card";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const { inventory, skills } = useGameStore();

  return (
    <div className="flex flex-col min-h-screen bg-wood/10">
      <Topbar onSettings={() => {}} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Card title="Bienvenido, Capitán">
            <p className="text-parchment">
              Bienvenido a tu aventura pirata. Navega entre islas, recolecta recursos y sube de nivel.
              <br />
              <br />
              <Card>
                <ResourceBar id="wood" amount={inventory.wood} label="Madera" />
                <ResourceBar id="iron" amount={inventory.iron} label="Hierro" />
                <ResourceBar id="food" amount={inventory.food} label="Comida" />
                <ResourceBar id="gold" amount={inventory.gold} label="Oro" />
              </Card>
              <Card>
                <ProgressBar current={skills.gathering?.xp ?? 0} max={10} label="XP de Recolección" />
              </Card>
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}