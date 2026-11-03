import { useState } from "react";
import { useGameStore } from "../../core/store";
import Button from "./Button";

type TopbarProps = {
  onSettings?: () => void;
};

export default function Topbar({ onSettings }: TopbarProps) {
  const { player } = useGameStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    if (!settingsOpen && onSettings) onSettings();
  };

  return (
    <div className="bg-wood bg-opacity-20 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-gold text-xl font-bold">🏴‍☠️ Pirate Idle</h1>
        <div className="flex items-center">
          <div className="text-parchment mr-4">
            <span className="text-gold">Oro: {player.gold}</span>
          </div>
          <div className="text-parchment">
            <span className="text-parchment">Rango: {player.rank}</span>
          </div>
          <div className="ml-4">
            <Button variant="secondary" onClick={toggleSettings}>
              Ajustes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
