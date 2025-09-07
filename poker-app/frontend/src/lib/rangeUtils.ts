const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const IDX: Record<string, number> = Object.fromEntries(RANKS.map((r, i) => [r, i]));

function normRanks(a: string, b: string): [string, string] {
  const ia = IDX[a];
  const ib = IDX[b];
  return ia < ib ? [a, b] : [b, a]; // return [high, low] in rank strength terms (A high => smaller index)
}

// Public API: parse tokens WITHOUT weights. Throw on any ':' occurrence.
export function keysFromText(range: string): Set<string> {
  const out = new Set<string>();
  if (!range?.trim()) return out;
  const toks = range
    .split(/[,\s]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  for (const tok of toks) {
    if (tok.includes(":")) {
      throw new Error("Weights are not supported. Remove \":...\" and try again.");
    }
    // 77-99
    let m = tok.match(/^([2-9TJQKA])\1-([2-9TJQKA])\2$/);
    if (m) {
      const a = m[1], b = m[2];
      const ia = IDX[a], ib = IDX[b];
      const lo = Math.min(ia, ib), hi = Math.max(ia, ib);
      for (let i = lo; i <= hi; i++) out.add(RANKS[i] + RANKS[i]);
      continue;
    }
    // A2s-A5s or A2o-A5o
    m = tok.match(/^([2-9TJQKA])([2-9TJQKA])([SO])?-([2-9TJQKA])([2-9TJQKA])\3?$/);
    if (m) {
      const a1 = m[1], a2 = m[2], so = m[3], b1 = m[4], b2 = m[5];
      const [hi, loStart] = normRanks(a1, a2);
      const [hiB, loEnd] = normRanks(b1, b2);
      if (hi !== hiB) continue; // invalid mixed-high dash range
      const ia = IDX[loStart], ib = IDX[loEnd];
      const lo = Math.min(ia, ib), hiIdx = Math.max(ia, ib);
      for (let i = lo; i <= hiIdx; i++) {
        const low = RANKS[i];
        if (low === hi) continue;
        if (!so) {
          out.add(hi + low + "s");
          out.add(low + hi + "o");
        } else if (so === "S") {
          out.add(hi + low + "s");
        } else {
          out.add(low + hi + "o");
        }
      }
      continue;
    }
    // KTs+ / AJo+
    m = tok.match(/^([2-9TJQKA])([2-9TJQKA])([SO])?\+$/);
    if (m) {
      const a1 = m[1], a2 = m[2], so = m[3];
      const [hi, lo] = normRanks(a1, a2);
      const start = IDX[lo];
      const end = IDX[hi] - 1;
      for (let i = start; i <= end; i++) {
        const low = RANKS[i];
        if (low === hi) continue;
        if (!so) {
          out.add(hi + low + "s");
          out.add(low + hi + "o");
        } else if (so === "S") {
          out.add(hi + low + "s");
        } else {
          out.add(low + hi + "o");
        }
      }
      continue;
    }
    // Exact pair 77
    m = tok.match(/^([2-9TJQKA])\1$/);
    if (m) {
      out.add(m[1] + m[1]);
      continue;
    }
    // Exact AKs / AKo
    m = tok.match(/^([2-9TJQKA])([2-9TJQKA])([SO])$/);
    if (m) {
      const a = m[1], b = m[2], so = m[3];
      const [hi, lo] = normRanks(a, b);
      if (so === "S") out.add(hi + lo + "s");
      else out.add(lo + hi + "o");
      continue;
    }
    // Unknown tokens ignored silently? We'll just skip invalid ones.
  }
  return out;
}

export function textFromKeys(keys: Set<string>): string {
  return Array.from(keys).sort().join(", ");
}
