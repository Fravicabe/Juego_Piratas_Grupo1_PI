import { useGameStore } from "../../core/store";

export default function Topbar() {
  const { player } = useGameStore();
  return (
    <div className="bg-wood bg-opacity-20 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-gold text-xl font-bold">🏴‍☠️ Pirate Idle</h1>
        <div className="text-parchment">
          <span className="text-parchment">Rango: {player.rank}</span>
        </div>
      </div>
    </div>
  );
}