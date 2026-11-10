type ResourceBarProps = { id: string; amount: number; label: string };

const ICONS: Record<string, string> = {
  wood: "🪵",
  iron: "⚙️",
  food: "🍖",
  gold: "🪙",
  provisions: "🍖",
  reputation: "⭐",
  crew: "👥",
};

export default function ResourceBar({ id, amount, label }: ResourceBarProps) {
  const icon = ICONS[id] ?? "📦";

  return (
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-gold">{icon}</span>
      <span className="text-gold font-bold">{Math.floor(amount)}</span>
      <span className="text-parchment">{label}</span>
    </div>
  );
}
