"use client";
import React from "react";
import { useTableStore } from "../store/useTableStore";

const isValidCard = (s: string) => /^[2-9TJQKA][shdc]$/.test(s);

export function BoardInput() {
  const board = useTableStore((s) => s.board);
  const setBoardCard = useTableStore((s) => s.setBoardCard);
  const compute = useTableStore((s) => s.compute);
  const n = board.length || 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[0, 1, 2, 3, 4].slice(0, n).map((idx) => (
        <input
          key={idx}
          className="w-16 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-700"
          placeholder={idx === 0 ? "As" : idx === 1 ? "Kd" : idx === 2 ? "2c" : "Ts"}
          value={board[idx] || ""}
          onChange={(e) => setBoardCard(idx, e.target.value.trim())}
        />
      ))}
      {n > 0 && (
        <button
          className="btn-primary"
          onClick={() => compute()}
          disabled={!board.slice(0, n).every((c) => isValidCard(c))}
        >
          Compute
        </button>
      )}
    </div>
  );
}

