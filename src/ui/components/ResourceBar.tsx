type ResourceBarProps = { id: string; amount: number; label: string };
export default function ResourceBar({ id, amount, label }: ResourceBarProps) {
  const icon = {
    wood: "🪵",
    iron: "⚙️",
    food: "🍖",
    gold: "🪙",
  }[id] as string;
  return (
    <div className="flex items-center items-center space-x-2 mb-2">
      <span className="text-gold">{icon}</span>
      <span className="text-wood">{amount}</span>
      <span className="text-parchment">{label}</span>
    </div>
  );
}