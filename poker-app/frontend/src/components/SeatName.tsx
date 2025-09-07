"use client";
import React from "react";
import type { SeatName as SeatNameType } from "../lib/seats";

export function SeatName({
  idx,
  name,
  x,
  y,
  side,
  onClick,
}: {
  idx: number;
  name: SeatNameType | string;
  x: string;
  y: string;
  side: "top" | "right" | "bottom" | "left";
  onClick: () => void;
}) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div className="px-3 py-1 rounded-md bg-neutral-900/70 border border-neutral-700 shadow-soft text-sm">
        {String(name)}
      </div>
    </div>
  );
}
