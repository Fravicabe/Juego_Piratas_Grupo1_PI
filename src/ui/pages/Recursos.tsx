import { useGameStore } from "../../core/store";
import ResourceBar from "../components/ResourceBar";
import Card from "../components/Card";

export default function Recursos() {
  const { inventory } = useGameStore();
  return (
    <div className="p-6">
      <Card title="Recursos">
        <ResourceBar id="gold" amount={inventory?.gold ?? 0} label="Oro" />
        <ResourceBar id="provisions" amount={inventory?.food ?? 0} label="Provisiones" />
        <ResourceBar id="reputation" amount={inventory?.wood ?? 0} label="Reputación" />
        <ResourceBar id="crew" amount={inventory?.iron ?? 0} label="Tripulación" />
      </Card>
    </div>
  );
}