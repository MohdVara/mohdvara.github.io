import { useEffect, useRef, type ReactNode } from "react";
export default function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus({preventScroll:true}); };
  }, []);
  return (
    <dialog
      className="iz-modal"
      ref={ref}
      aria-label="Incident interaction"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={event => {
        if (!['ArrowDown','ArrowUp'].includes(event.key) || (event.target instanceof HTMLInputElement)) return;
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }}
    >
      <div className="iz-modal-top">
        <span className="mono">INCIDENT ZERO / FIELD NOTES</span>
        <button onClick={onClose} aria-label="Close interaction">
          Close ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
