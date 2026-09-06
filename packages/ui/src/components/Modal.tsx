import * as React from "react";

export function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        className="bg-surface-bg w-full max-w-lg rounded-lg shadow-lg relative p-6"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full hover:bg-surface-card focus-visible:outline-primary-500"
          aria-label="Close modal"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}
