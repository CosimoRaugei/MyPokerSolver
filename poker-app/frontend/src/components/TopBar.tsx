"use client";
import { useTableStore } from "../store/useTableStore";
import { MethodName } from "../types";

export function TopBar() {
  const playersCount = useTableStore((s) => s.playersCount);
  const setPlayersCount = useTableStore((s) => s.setPlayersCount);
  const method = useTableStore((s) => s.method);
  const setMethod = useTableStore((s) => s.setMethod);
  const iterations = useTableStore((s) => s.iterations);
  const setIterations = useTableStore((s) => s.setIterations);
  const seed = useTableStore((s) => s.seed);
  const setSeed = useTableStore((s) => s.setSeed);
  const compute = useTableStore((s) => s.compute);

  return (
    <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between z-20">
      <div className="text-lg font-semibold">Range vs Range Equity</div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Players</label>
          <select
            className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1"
            value={playersCount}
            onChange={(e) => setPlayersCount(parseInt(e.target.value, 10))}
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Method</label>
          <select
            className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1"
            value={method}
            onChange={(e) => setMethod(e.target.value as MethodName)}
          >
            <option value="auto">Auto</option>
            <option value="exact">Exact</option>
            <option value="mc">MC</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Iterations</label>
          <input
            type="number"
            className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 w-28"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Seed</label>
          <input
            type="number"
            className="bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 w-24"
            value={seed ?? ""}
            onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          />
        </div>
        <button className="btn-primary" onClick={() => compute()}>Compute</button>
      </div>
    </div>
  );
}
