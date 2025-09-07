import { create } from "zustand";
import { SeatName, seatOrder } from "../lib/seats";
import type { MethodName, EquityRequest, EquityResult, SeatEquity } from "../types";
import { api } from "../lib/api";
import { keysFromText, textFromKeys } from "../lib/rangeUtils";

type SeatState = {
  seat: SeatName;
  folded: boolean;
  keys: Set<string>;
  equity?: SeatEquity;
};

type TableState = {
  playersCount: number; // 2-6
  seats: SeatState[];
  board: string[]; // [] | [3] | [4] | [5]
  method: MethodName;
  iterations: number;
  seed?: number;
  computing: boolean;
  // modal state
  modalEditSeat?: SeatName;
  modalBreakSeat?: SeatName;
  // actions
  setPlayersCount: (n: number) => void;
  setFolded: (seat: SeatName, folded: boolean) => void;
  setSeatKeys: (seat: SeatName, keys: Set<string>) => void;
  setMethod: (m: MethodName) => void;
  setIterations: (n: number) => void;
  setSeed: (n?: number) => void;
  setBoardCard: (idx: number, card: string) => void;
  resetBoard: () => void;
  nextStreet: () => void;
  compute: () => Promise<void>;
  computeIfReady: () => Promise<void>;
  openEditFor: (seat: SeatName) => void;
  closeEdit: () => void;
  openBreakFor: (seat: SeatName) => void;
  closeBreak: () => void;
};

const PRELOAD: Record<SeatName, string> = {
  UTG: "AKs, AKo, QQ-TT, A5s-A2s, KQs-KTs, Q9s+",
  HJ: "",
  CO: "",
  BTN: "",
  SB: "",
  BB: "JJ-99, AQs-AJs, KQs, JTo+",
};

export const useTableStore = create<TableState>((set, get) => ({
  playersCount: 6,
  seats: seatOrder.map((s) => ({ seat: s, folded: false, keys: keysFromText(PRELOAD[s] || "") })),
  board: [],
  method: "auto",
  iterations: 20000,
  seed: 1,
  computing: false,
  modalEditSeat: undefined,
  modalBreakSeat: undefined,
  setPlayersCount: (n) => set({ playersCount: Math.min(6, Math.max(2, n)) }),
  setFolded: (seat, folded) =>
    set({ seats: get().seats.map((x) => (x.seat === seat ? { ...x, folded } : x)) }),
  setSeatKeys: (seat, keys) =>
    set({ seats: get().seats.map((x) => (x.seat === seat ? { ...x, keys: new Set(keys) } : x)) }),
  setMethod: (m) => set({ method: m }),
  setIterations: (n) => set({ iterations: Math.max(1000, n) }),
  setSeed: (n) => set({ seed: n }),
  setBoardCard: (idx, card) => {
    const board = [...get().board];
    board[idx] = card;
    set({ board });
  },
  resetBoard: () => set({ board: [] }),
  nextStreet: () => {
    const b = get().board;
    if (b.length === 0) set({ board: ["", "", ""] });
    else if (b.length === 3) set({ board: [b[0], b[1], b[2], ""] });
    else if (b.length === 4) set({ board: [b[0], b[1], b[2], b[3], ""] });
  },
  compute: async () => {
    const state = get();
    if (state.computing) return;
    set({ computing: true });
    try {
      const ACTIVE_ORDER: SeatName[] = ["BB", "SB", "BTN", "CO", "HJ", "UTG"];
      const activeSeats = ACTIVE_ORDER.slice(0, state.playersCount)
        .map((sn) => state.seats.find((s) => s.seat === sn)!)
        .filter(Boolean);
      const players = activeSeats.map((s) => ({
        seat: s.seat,
        folded: s.folded,
        range: { text: textFromKeys(s.keys) },
      }));

      const req: EquityRequest = {
        players,
        method: state.method,
        iterations: state.iterations,
        seed: state.seed,
      };
      let res: EquityResult | null = null;
      const board = state.board.filter(Boolean);
      if (board.length >= 3) {
        res = await api.equityPostflop({ ...req, board });
      } else {
        res = await api.equityPreflop(req);
      }
      const perSeat = res.perSeat;
      const seats = state.seats.map((s) => {
        const found = perSeat.find((p) => p.seat === s.seat);
        return { ...s, equity: found };
      });
      set({ seats });
    } catch (e) {
      console.error(e);
    } finally {
      set({ computing: false });
    }
  },
  computeIfReady: async () => {
    const st = get();
    // compute if at least two non-folded seats have ranges
    const ACTIVE_ORDER: SeatName[] = ["BB", "SB", "BTN", "CO", "HJ", "UTG"];
    const active = ACTIVE_ORDER.slice(0, st.playersCount)
      .map((sn) => st.seats.find((s) => s.seat === sn)!)
      .filter((s) => !s.folded && s.keys.size > 0);
    if (active.length >= 2) {
      await get().compute();
    }
  },
  openEditFor: (seat) => set({ modalEditSeat: seat }),
  closeEdit: () => set({ modalEditSeat: undefined }),
  openBreakFor: (seat) => set({ modalBreakSeat: seat }),
  closeBreak: () => set({ modalBreakSeat: undefined }),
}));
