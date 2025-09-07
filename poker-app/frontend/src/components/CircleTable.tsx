"use client";
import React from "react";
import { SeatName } from "./SeatName";

const SEAT_ORDER = ["BB", "SB", "BTN", "CO", "HJ", "UTG"] as const;

export function CircleTable({
  players,
  onSeatClick,
}: {
  players: number; // 2..6
  onSeatClick: (idx: number) => void;
}) {
  const seats = SEAT_ORDER.slice(0, players);

  // Geometry
  // Container: responsive clamp; circle radius ~ 40% of box
  // angle 0 = 12:00, increasing counterclockwise
  const radiusPct = 40; // circle radius as percent of container
  const labelOffsetPct = 8; // push labels outward beyond the circle

  return (
    <div
      className="relative isolate mx-auto my-6"
      style={{ width: "min(92vw, 720px)", height: "min(92vw, 720px)" }}
    >
      {/* Circle background (decorative only) */}
      <div className="absolute inset-0 z-0 pointer-events-none rounded-full border border-dotted border-white/20" />

      {/* Seat labels placed around the circle */}
      {seats.map((name, i) => {
        const step = (2 * Math.PI) / seats.length;
        const theta = i * step; // 0, step, 2*step, ... (0 at 12:00)
        // position center at 50/50; y axis is downwards
        const x = 50 - (radiusPct + labelOffsetPct) * Math.sin(theta);
        const y = 50 - (radiusPct + labelOffsetPct) * Math.cos(theta);

        // Choose outward popover side by quadrant
        let side: "top" | "right" | "bottom" | "left" = "top";
        const deg = (theta * 180) / Math.PI; // 0 at top, CCW positive
        if (deg >= 45 && deg < 135) side = "left";
        else if (deg >= 135 && deg < 225) side = "bottom";
        else if (deg >= 225 && deg < 315) side = "right";
        else side = "top";

        return (
          <SeatName
            key={name}
            idx={i}
            name={name as any}
            x={`${x}%`}
            y={`${y}%`}
            side={side}
            onClick={() => onSeatClick(i)}
          />
        );
      })}
    </div>
  );
}
