export const SEATS_6MAX = ["UTG", "HJ", "CO", "BTN", "SB", "BB"] as const;
export type SeatName = typeof SEATS_6MAX[number];

export const seatOrder: SeatName[] = [...SEATS_6MAX];

