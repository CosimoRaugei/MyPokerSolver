"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { textFromKeys } from "../lib/rangeUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  seat: string;
  keys: Set<string>;
  board: string[];
};

export function RangeBreakdown({ open, onClose, seat, keys, board }: Props) {
  const [combos, setCombos] = useState<{ c1: string; c2: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    const text = textFromKeys(keys);
    api
      .rangeExpand({ range: text || "", board: board.filter(Boolean) })
      .then((res) => setCombos(res.combos))
      .catch(() => setCombos([]));
  }, [open, keys, board]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="fixed z-[1001] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,720px)] max-h-[85vh] overflow-auto card rounded-2xl p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Range Breakdown - {seat}</div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="text-sm text-neutral-400">Combos after blockers: {combos.length}</div>
        <div className="grid grid-cols-3 gap-2">
          {combos.map((c, idx) => (
            <div
              key={idx}
              className="px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-between"
            >
              <span>
                {c.c1} {" "} {c.c2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
