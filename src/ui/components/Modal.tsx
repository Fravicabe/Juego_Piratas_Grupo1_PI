import { useEffect } from "react";
type ModalProps = { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode };
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-wood border-2 border-gold rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto text-parchment">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gold font-bold text-xl">{title}</h2>
          <button onClick={onClose} className="text-gold hover:text-parchment text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}