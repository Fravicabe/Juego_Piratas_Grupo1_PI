type CardProps = { children: React.ReactNode; title?: string };
export default function Card({ children, title }: CardProps) {
  return (
    <div className="bg-parchment/10 border-2 border-wood rounded-lg p-4 text-parchment shadow">
      {title && <h3 className="text-gold font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
}
