type ProgressBarProps = { current: number; max: number; label?: string };

export default function ProgressBar({ current, max, label }: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const percent = Math.min(Math.max(current / safeMax, 0), 1) * 100;

  return (
    <>
      <div className="w-full bg-sea/20 rounded-full h-2 mb-1">
        <div
          className="bg-gold rounded-full h-2 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-parchment/80">
        {label ?? `${Math.floor(current)} / ${Math.round(safeMax)}`}
      </div>
    </>
  );
}
