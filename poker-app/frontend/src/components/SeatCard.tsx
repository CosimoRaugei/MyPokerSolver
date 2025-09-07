"use client";
import React, { useMemo, useState } from "react";
import { useTableStore } from "../store/useTableStore";
import { RangeEditorDialog } from "./RangeEditorDialog";
import { RangeBreakdown } from "./RangeBreakdown";
import { textFromKeys } from "../lib/rangeUtils";

type Props = { seat: string };

export function SeatCard({ seat }: Props) {
  const seatState = useTableStore((s) => s.seats.find((x) => x.seat === seat)!);
  const setFolded = useTableStore((s) => s.setFolded);
  const setSeatKeys = useTableStore((s) => s.setSeatKeys);
  const board = useTableStore((s) => s.board);
  const [openEdit, setOpenEdit] = useState(false);
  const [openBreak, setOpenBreak] = useState(false);
  const [hovered, setHovered] = useState(false);

  const equity = seatState.equity;
  const isParticipating = equity?.participating;

  const active = hovered || openEdit || openBreak;
  const rangeText = useMemo(() => textFromKeys(seatState.keys), [seatState.keys]);

  return (
    <div
      data-active={active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative z-10 data-[active=true]:z-[80] card p-3 w-[clamp(160px,18vw,220px)] ${
        seatState.folded ? "opacity-60" : ""
      }`}
      style={{ margin: "0.25rem" }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{seat}</div>
        {equity && isParticipating && (
          <div className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md">
            Equity {equity.equity.toFixed(1)}%
          </div>
        )}
        {equity && !isParticipating && (
          <div className="text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-md">Folded</div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={seatState.folded}
            onChange={(e) => setFolded(seat as any, e.target.checked)}
          />
          Fold
        </label>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setOpenEdit(true)}>
            Edit Range
          </button>
          <button
            className="btn-secondary"
            disabled={!seatState.equity}
            onClick={() => setOpenBreak(true)}
          >
            Breakdown
          </button>
        </div>
      </div>
      {rangeText && (
        <div className="mt-2 text-xs text-neutral-400 line-clamp-2" title={rangeText}>
          {rangeText}
        </div>
      )}
      <RangeEditorDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        seat={seat}
        keys={seatState.keys}
        onSave={(k) => setSeatKeys(seat as any, k)}
      />
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
