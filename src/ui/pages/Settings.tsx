import { useState } from "react";
import { useGameStore } from "../../core/store";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function Settings() {
  const [resetOpen, setResetOpen] = useState(false);

  const player = useGameStore((s) => s.player);
  const islands = useGameStore((s) => s.islands);
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const totalPlaytime = useGameStore((s) => s.totalPlaytime);
  const reset = useGameStore((s) => s.reset);

  const currentIsland = currentIslandId ? islands[currentIslandId] : null;
  const playedMinutes = Math.floor(totalPlaytime / 60);

  const confirmReset = () => {
    reset();
    setResetOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-gold text-2xl font-bold">Ajustes</h1>

      <Card title="Partida actual">
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
            <dt className="opacity-80">Capitán</dt>
            <dd className="font-bold text-gold">{player.name}</dd>
          </div>
          <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
            <dt className="opacity-80">Rango</dt>
            <dd className="font-bold text-gold">{player.rank}</dd>
          </div>
          <div className="bg-sea/20 rounded-lg p-3 border border-sea/30">
            <dt className="opacity-80">Isla actual</dt>
            <dd className="font-bold text-gold">{currentIsland?.name ?? "—"}</dd>
          </div>
        </dl>
        <p className="text-xs text-parchment mt-3 opacity-80">
          Tiempo jugado: {playedMinutes} min. El progreso se guarda automáticamente en este
          navegador.
        </p>
      </Card>

      <Card title="Zona de peligro">
        <p className="text-sm text-parchment mb-3">
          Reiniciar la partida borra el guardado local y vuelve a empezar desde Tortuga. Esta acción
          no se puede deshacer.
        </p>
        <Button variant="secondary" onClick={() => setResetOpen(true)}>
          Reiniciar partida
        </Button>
      </Card>

      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="¿Reiniciar partida?">
        <p className="text-sm text-parchment mb-4">
          Perderás tu progreso actual: recursos, islas desbloqueadas y habilidades. ¿Seguro que
          quieres empezar una nueva travesía?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmReset}>Sí, reiniciar</Button>
        </div>
      </Modal>
    </div>
  );
}
