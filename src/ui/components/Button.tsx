type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};
export default function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  const base = "px-4 py-2 rounded font-bold shadow transition";
  const styles = variant === "primary" ? "bg-gold text-wood hover:bg-parchment" : "bg-wood text-parchment hover:bg-sea";
  return <button className={`${base} ${styles}`} onClick={onClick}>{children}</button>;
}
