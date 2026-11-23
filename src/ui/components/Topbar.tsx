import { useGameStore } from "../../core/store";
import { resourceLabel } from "../../features/sailing/resources";

export default function Topbar() {
  const player = useGameStore((s) => s.player);
  const gold = useGameStore((s) => s.inventory.gold);

  return (
    <div className="bg-wood bg-opacity-20 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-gold text-xl font-bold">🏴‍☠️ Pirate Idle</h1>
        <div className="flex items-center gap-4 text-parchment">
          <span aria-label={`Oro disponible: ${Math.floor(gold)}`}>
            <strong className="text-gold">
              {resourceLabel("gold")}: {Math.floor(gold)}
            </strong>
          </span>
          <span>Rango: {player.rank}</span>
        </div>
      </div>
    </div>
  );
}
