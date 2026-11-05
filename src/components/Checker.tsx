"use client";

import { FormEvent, useMemo, useState } from "react";
import { Favicon } from "@/components/Favicon";

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

function changeTone(change: number | null): {
  text: string;
  bg: string;
} {
  if (change === null) return { text: "text-zinc-600", bg: "bg-zinc-100" };
  if (change > 0) return { text: "text-emerald-700", bg: "bg-emerald-50" };
  if (change < 0) return { text: "text-rose-700", bg: "bg-rose-50" };
  return { text: "text-zinc-600", bg: "bg-zinc-100" };
}

function ChangePill({
  change,
  changeLabel,
  size = "md",
}: {
  change: number | null;
  changeLabel: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const tone = changeTone(change);
  const label =
    change === null
      ? "n/a"
      : change === 0
        ? "No change"
        : (changeLabel ?? formatScore(change));
  const sizeClass =
    size === "lg"
      ? "min-w-[4.5rem] px-3 py-1.5 text-sm"
      : size === "sm"
        ? "min-w-[3rem] px-2 py-0.5 text-xs"
        : "min-w-[3.5rem] px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-semibold tabular-nums ${tone.text} ${tone.bg} ${sizeClass}`}
    >
      {label}
    </span>
  );
}

function ScoreBlock({
  value,
  label,
  emphasize = false,
  large = true,
}: {
  value: number | null;
  label: string;
  emphasize?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center rounded-2xl bg-zinc-100/90 px-3 py-5 shadow-sm ring-1 ring-zinc-900/5 sm:px-4 sm:py-6 ${
        emphasize ? "bg-white" : ""
      }`}
    >
      <div
        className={`font-semibold tabular-nums tracking-tight text-zinc-900 ${
          large
            ? "text-5xl sm:text-6xl leading-none"
            : "text-3xl sm:text-4xl leading-none"
        }`}
      >
        {formatScore(value)}
      </div>
      <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function DomainHeader({ domain, size = 22 }: { domain: string; size?: number }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5">
      <Favicon domain={domain} size={size} />
      <span className="truncate text-sm font-semibold text-zinc-900 sm:text-base">
        {domain}
      </span>
    </div>
  );
}

function SingleResult({ row }: { row: ResultRow }) {
  return (
    <article className="rounded-2xl bg-zinc-50 px-4 py-6 text-center shadow-sm ring-1 ring-zinc-200 sm:px-7 sm:py-8">
      <DomainHeader domain={row.domain} size={24} />
      <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
        <ScoreBlock value={row.dr3} label="DR now" />
        <div className="flex shrink-0 flex-col items-center gap-2">
          <ChangePill change={row.change} changeLabel={row.changeLabel} size="lg" />
        </div>
        <ScoreBlock value={row.dr4} label="DR4" emphasize />
      </div>
    </article>
  );
}

function MultiResultCard({ row }: { row: ResultRow }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <DomainHeader domain={row.domain} size={20} />
      <div className="mt-4 flex items-center gap-2.5 sm:gap-3">
        <ScoreBlock value={row.dr3} label="DR now" large={false} />
        <div className="flex shrink-0 flex-col items-center">
          <ChangePill change={row.change} changeLabel={row.changeLabel} size="sm" />
        </div>
        <ScoreBlock value={row.dr4} label="DR4" emphasize large={false} />
      </div>
    </article>
  );
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
        <div className="mt-8 space-y-4" aria-live="polite">
          {data.results.length === 1 ? (
            <SingleResult row={data.results[0]} />
          ) : (
            <div className="space-y-3">
              {data.results.map((row) => (
                <MultiResultCard key={row.domain} row={row} />
              ))}
            </div>
          )}

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
