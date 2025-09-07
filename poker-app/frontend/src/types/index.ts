export type MethodName = "auto" | "exact" | "mc";

export type Card = string; // e.g., "As"

export type RangeSpec = { text: string };

export type PlayerInput = {
  seat: "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";
  folded: boolean;
  range: RangeSpec;
};

export type EquityRequest = {
  players: PlayerInput[];
  board?: Card[];
  method: MethodName;
  iterations?: number;
  seed?: number;
};

export type SeatEquity = {
  seat: PlayerInput["seat"];
  equity: number;
  tie: number;
  participating: boolean;
};

export type EquityResult = {
  perSeat: SeatEquity[];
  method: "exact" | "mc";
  iterations?: number;
};

export type ExpandRequest = { range: string; board?: Card[] };
export type ExpandResponse = { combos: { c1: Card; c2: Card }[] };
