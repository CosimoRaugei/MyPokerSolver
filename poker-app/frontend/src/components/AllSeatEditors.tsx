"use client";
import React from "react";
import { useTableStore } from "../store/useTableStore";
import RangeMatrix from "./RangeMatrix";

export function AllSeatEditors() {
  const seats = useTableStore((s) => s.seats);
  const setSeatKeys = useTableStore((s) => s.setSeatKeys);

  return (
    <div className="card p-4 space-y-3 mt-4">
      <div className="text-sm text-neutral-400">Debug: All seat matrices are shown open below.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seats.map((s) => (
          <div key={s.seat} className="card p-3">
            <div className="font-semibold mb-2">{s.seat}</div>
            <RangeMatrix value={s.keys} onChange={(next) => setSeatKeys(s.seat, next)} />
            <div className="mt-2 flex gap-2">
              <button className="btn-secondary" onClick={() => setSeatKeys(s.seat, new Set())}>Clear</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

