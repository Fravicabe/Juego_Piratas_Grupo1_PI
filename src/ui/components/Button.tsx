type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  ariaLabel?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded font-bold shadow transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-gold text-wood hover:bg-parchment"
      : "bg-wood text-parchment hover:bg-sea";

  return (
    <button
      type="button"
      className={`${base} ${styles}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
