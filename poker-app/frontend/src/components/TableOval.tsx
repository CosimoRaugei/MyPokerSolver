"use client";
import React from "react";
import { seatOrder } from "../lib/seats";
import { SeatCard } from "./SeatCard";
import { useTableStore } from "../store/useTableStore";

const POS = [0, 60, 120, 180, 240, 300];

export function TableOval() {
  const playersCount = useTableStore((s) => s.playersCount);
  const seats = seatOrder.slice(0, playersCount);
  return (
    <div className="relative isolate w-full aspect-[2/1]">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full rounded-full bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800" />
        <div className="absolute inset-6 rounded-full border-2 border-dotted border-neutral-700" />
      </div>
      <div className="relative z-10 overflow-visible">
        {seats.map((seat, idx) => {
          const angle = POS[idx];
          return (
            <div
              key={seat}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${angle}deg) translate(0, -40%) rotate(-${angle}deg) translateX(-50%)`,
              }}
            >
              <SeatCard seat={seat} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
