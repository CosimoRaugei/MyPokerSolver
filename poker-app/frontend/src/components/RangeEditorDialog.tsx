"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RangeMatrix from "./RangeMatrix";

type Props = {
  open: boolean;
  onClose: () => void;
  seat: string;
  keys: Set<string>;
  onSave: (keys: Set<string>) => void;
};

export function RangeEditorDialog({ open, onClose, seat, keys, onSave }: Props) {
  const [localKeys, setLocalKeys] = useState<Set<string>>(new Set());
  const [error] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const start = new Set(keys);
    setLocalKeys(start);
    // keep textless editor; compute text only on save for display if needed
  }, [open, keys]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="fixed z-[1001] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,1000px)] max-h-[85vh] overflow-auto card rounded-2xl p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Edit Range - {seat}</div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Matrix (click to toggle)</div>
            <RangeMatrix value={localKeys} onChange={setLocalKeys} />
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setLocalKeys(new Set())}>
                Clear
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  onSave(new Set(localKeys));
                  onClose();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
