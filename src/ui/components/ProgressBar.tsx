type ProgressBarProps = { current: number; max: number; label?: string };

export default function ProgressBar({ current, max, label }: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const safeCurrent = Math.min(Math.max(current, 0), safeMax);
  const percent = (safeCurrent / safeMax) * 100;
  const text = label ?? `${Math.floor(current)} / ${Math.round(safeMax)}`;

  return (
    <>
      <div
        className="w-full bg-sea/20 rounded-full h-2 mb-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeCurrent}
        aria-valuetext={text}
      >
        <div
          className="bg-gold rounded-full h-2 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-parchment/80">{text}</div>
    </>
  );
}
