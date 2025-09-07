"use client";
import React, { useState } from "react";
import { useTableStore } from "../store/useTableStore";
import RangeMatrix from "./RangeMatrix";
import { RangeBreakdown } from "./RangeBreakdown";

export function PlayerRangeCard({ seat }: { seat: string }) {
  const seatState = useTableStore((s) => s.seats.find((p) => p.seat === seat)!);
  const setSeatKeys = useTableStore((s) => s.setSeatKeys);
  const board = useTableStore((s) => s.board);
  const [openBreak, setOpenBreak] = useState(false);

  if (!seatState) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{seat}</div>
        {seatState.equity?.participating && (
          <div className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md">
            Equity {seatState.equity.equity.toFixed(1)}%
          </div>
        )}
      </div>
      <RangeMatrix value={seatState.keys} onChange={(next) => setSeatKeys(seat as any, next)} />
      <div className="mt-3 flex gap-2">
        <button className="btn-secondary" onClick={() => setSeatKeys(seat as any, new Set())}>
          Clear
        </button>
        <button className="btn-primary" onClick={() => setOpenBreak(true)}>
          Breakdown
        </button>
      </div>
      <RangeBreakdown
        open={openBreak}
        onClose={() => setOpenBreak(false)}
        seat={seat}
        keys={seatState.keys}
        board={board}
      />
    </div>
  );
}

