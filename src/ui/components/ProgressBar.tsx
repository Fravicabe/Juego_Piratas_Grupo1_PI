type ProgressBarProps = { current: number; max: number; label?: string };
export default function ProgressBar({ current, max, label }: ProgressBarProps) {
  const percent = Math.min(Math.max(current / Math.max(max, 1), 0), 1) * 100;
  return (
    <>
      <div className="w-full bg-sea/20 rounded-full h-2 mb-2">
        <div
          className="bg-gold rounded-full h-2 w-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-parchment flex justify-between">
        <span>{current}</span>
        <span>{max}</span>
        {label && <span>{label}</span>}
      </div>
    </>
  );
}