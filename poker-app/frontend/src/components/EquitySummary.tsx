"use client";
import React from "react";
import { useTableStore } from "../store/useTableStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import type { SeatName } from "../lib/seats";

export function EquitySummary() {
  const seats = useTableStore((s) => s.seats);
  const playersCount = useTableStore((s) => s.playersCount);
  const method = useTableStore((s) => s.method);
  const iterations = useTableStore((s) => s.iterations);
  const seed = useTableStore((s) => s.seed);
  const ACTIVE_ORDER: SeatName[] = ["BB", "SB", "BTN", "CO", "HJ", "UTG"];
  const activeSeats = ACTIVE_ORDER.slice(0, playersCount);
  const data = activeSeats
    .map((sn) => seats.find((s) => s.seat === sn)!)
    .filter(Boolean)
    .map((s) => ({ name: s.seat, equity: s.equity?.equity || 0 }));

  if (data.every((d) => d.equity === 0)) {
    return <div className="text-sm text-neutral-400">No results yet. Click Compute.</div>;
  }

  return (
    <div className="w-full h-64">
      <div className="text-xs text-neutral-400 mb-1">
        Method: {method.toUpperCase()} • Iterations: {iterations} • Seed: {seed ?? "-"}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={60} />
          <Tooltip formatter={(v) => `${(v as number).toFixed(1)}%`} />
          <Bar dataKey="equity" fill="#60a5fa">
            <LabelList dataKey="equity" position="right" formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
