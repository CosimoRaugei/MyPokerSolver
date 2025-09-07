import axios from "axios";
import type { EquityRequest, EquityResult, ExpandRequest, ExpandResponse } from "../types";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export const api = {
  equityPreflop: async (req: EquityRequest) => {
    const { data } = await axios.post<EquityResult>(`${BASE}/equity/preflop`, req);
    return data;
  },
  equityPostflop: async (req: EquityRequest) => {
    const { data } = await axios.post<EquityResult>(`${BASE}/equity/postflop`, req);
    return data;
  },
  rangeExpand: async (req: ExpandRequest) => {
    const { data } = await axios.post<ExpandResponse>(`${BASE}/range/expand`, req);
    return data;
  },
};
