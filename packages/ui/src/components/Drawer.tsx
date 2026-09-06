import * as React from "react";

export function Drawer({
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
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/80"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative ml-auto h-full w-full max-w-md bg-surface-bg shadow-lg p-6 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full hover:bg-surface-card focus-visible:outline-primary-500"
          aria-label="Close drawer"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}
