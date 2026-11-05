"use client";

import { FormEvent, useMemo, useState } from "react";

type ResultRow = {
  domain: string;
  dr3: number | null;
  dr4: number | null;
  change: number | null;
  changeLabel: string | null;
};

type ApiOk = {
  results: ResultRow[];
  attribution: string;
  attributionUrl: string;
  note: string;
};

type ApiErr = { error: string };

function formatScore(n: number | null): string {
  if (n === null || n === undefined) return "n/a";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function changeClass(change: number | null): string {
  if (change === null) return "text-zinc-500";
  if (change > 0) return "text-emerald-600";
  if (change < 0) return "text-rose-600";
  return "text-zinc-600";
}

export function Checker({ initialDomain = "" }: { initialDomain?: string }) {
  const [input, setInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiOk | null>(null);

  const multiHint = useMemo(() => {
    const parts = input.split(/[\s,;]+/).filter(Boolean);
    return parts.length > 1;
  }, [input]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: input }),
      });
      const json = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || "error" in json) {
        setData(null);
        setError(("error" in json && json.error) || "Something went wrong.");
        return;
      }
      setData(json);
    } catch {
      setData(null);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="domains">
          Domain or domains
        </label>
        <input
          id="domains"
          name="domains"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="example.com or up to 5 domains"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 shadow-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4"
          aria-describedby="domain-help"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="min-h-12 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check DR4"}
        </button>
      </form>
      <p id="domain-help" className="mt-2 text-sm text-zinc-500">
        Subdomains get their own DR4 score, so this checks the exact host you type.
        {multiHint ? " Separate multiple domains with commas or spaces." : " Optional: compare up to 5 at once."}
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="mt-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Domain
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      DR now
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      DR4
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((row) => (
                    <tr key={row.domain} className="border-t border-zinc-100">
                      <th scope="row" className="px-4 py-4 font-semibold text-zinc-900">
                        {row.domain}
                      </th>
                      <td className="px-4 py-4 tabular-nums text-zinc-700">
                        {formatScore(row.dr3)}
                      </td>
                      <td className="px-4 py-4 tabular-nums text-lg font-semibold text-zinc-900">
                        {formatScore(row.dr4)}
                      </td>
                      <td className={`px-4 py-4 tabular-nums font-medium ${changeClass(row.change)}`}>
                        {row.changeLabel ?? "n/a"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            <a
              href={data.attributionUrl}
              className="font-medium text-zinc-700 underline-offset-2 hover:underline"
              rel="noopener noreferrer"
            >
              {data.attribution}
            </a>
            . Not affiliated with Ahrefs.
          </p>
          <p className="text-sm text-zinc-500">{data.note}</p>
        </div>
      ) : null}
    </div>
  );
}
