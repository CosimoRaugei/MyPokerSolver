"use client";
import React from "react";
import { useTableStore } from "../store/useTableStore";
import { BoardInput } from "./BoardInput";

export function StreetControls() {
  const board = useTableStore((s) => s.board);
  const next = useTableStore((s) => s.nextStreet);
  const reset = useTableStore((s) => s.resetBoard);

  const stage = board.length === 0 ? "Preflop" : board.length === 3 ? "Flop" : board.length === 4 ? "Turn" : "River";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{stage}</div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={reset}>Reset Board</button>
          {board.length < 5 && (
            <button className="btn-primary" onClick={next}>
              {board.length === 0 ? "Proceed to Flop" : board.length === 3 ? "Proceed to Turn" : "Proceed to River"}
            </button>
          )}
        </div>
      </div>
      <BoardInput />
    </div>
  );
}

