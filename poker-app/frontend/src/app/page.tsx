"use client";
import { TopBar } from "../components/TopBar";
import { CircleTable } from "../components/CircleTable";
import { StreetControls } from "../components/StreetControls";
import { EquitySummary } from "../components/EquitySummary";
import { useTableStore } from "../store/useTableStore";
import { useEffect } from "react";
import { PlayerRangeCard } from "../components/PlayerRangeCard";
import { SeatName as SeatNameType } from "../lib/seats";

export default function Page() {
  const computeIfReady = useTableStore((s) => s.computeIfReady);
  useEffect(() => {
    // initial compute to show preloaded ranges
    computeIfReady();
  }, [computeIfReady]);

  return (
    <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
      <TopBar />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 card p-4">
          <CircleTable players={useTableStore((s) => s.playersCount)} onSeatClick={() => {}} />
        </div>
        <div className="card p-4 space-y-4">
          <StreetControls />
          <EquitySummary />
        </div>
      </div>
      <RangeGrid />
    </div>
  );
}

function RangeGrid() {
  const playersCount = useTableStore((s) => s.playersCount);
  const seats = useTableStore((s) => s.seats);
  const ACTIVE_ORDER: SeatNameType[] = ["BB", "SB", "BTN", "CO", "HJ", "UTG"];
  const activeSeats = ACTIVE_ORDER.slice(0, playersCount)
    .map((sn) => seats.find((s) => s.seat === sn)!)
    .filter(Boolean)
    .map((s) => s.seat);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activeSeats.map((seat) => (
        <PlayerRangeCard key={seat} seat={seat} />
      ))}
    </div>
  );
}
