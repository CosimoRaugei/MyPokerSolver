"use client";
import React from "react";
const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

function handKey(row: number, col: number) {
  const r = RANKS[row], c = RANKS[col];
  if (row === col) return r + r;       // pair
  if (row < col) return r + c + 's';   // suited (upper)
  return c + r + 'o';                  // offsuit (lower)
}

export default function RangeMatrix({
  value,
  onChange,
}: { value: Set<string>; onChange: (next: Set<string>) => void }) {

  const toggle = (k: string) => {
    const next = new Set(value);
    next.has(k) ? next.delete(k) : next.add(k);
    onChange(next);
  };

  return (
    <div className="inline-grid" style={{ gridTemplateColumns: `auto repeat(13, 2.2rem)` }}>
      <div />
      {RANKS.map((c) => (
        <div key={'colh'+c} className="text-xs text-center opacity-70">{c}</div>
      ))}
      {RANKS.map((r, row) => (
        <React.Fragment key={'row'+r}>
          <div className="text-xs pr-2 text-right opacity-70">{r}</div>
          {RANKS.map((c, col) => {
            const k = handKey(row, col);
            const on = value.has(k);
            const isPair = row === col;
            const isSuited = row < col;
            const cls =
              'm-[2px] h-9 w-9 rounded-md text-[10px] flex items-center justify-center cursor-pointer select-none ' +
              (on ? 'ring-2 ring-blue-400 bg-blue-500/20 ' : 'bg-white/5 hover:bg-white/10 ') +
              (isPair ? 'border border-amber-400/40 ' : isSuited ? 'border border-emerald-400/40 ' : 'border border-indigo-400/40 ');
            return (
              <div key={k} className={cls} title={k} onClick={() => toggle(k)}>
                {k}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
