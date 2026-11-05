import { NextRequest, NextResponse } from "next/server";
import { parseDomainList } from "@/lib/domain";
import { fetchDrPair } from "@/lib/ahrefs";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function formatChange(change: number | null): string | null {
  if (change === null) return null;
  if (change > 0) return `+${change}`;
  return String(change);
}

async function handle(domainsRaw: string) {
  const parsed = parseDomainList(domainsRaw, 5);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const hosts = parsed.hosts;
  if (!hosts || hosts.length === 0) {
    return NextResponse.json({ error: "Enter at least one domain." }, { status: 400 });
  }

  const results = [];
  for (const host of hosts) {
    const pair = await fetchDrPair(host);
    if (!pair.ok) {
      return NextResponse.json({ error: pair.error }, { status: pair.status });
    }
    results.push({
      ...pair.data,
      changeLabel: formatChange(pair.data.change),
    });
  }

  return NextResponse.json(
    {
      results,
      attribution: "Domain Rating by Ahrefs",
      attributionUrl: "https://ahrefs.com",
      note: "Subdomains get their own DR4 score. This check uses the exact host you typed.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(`dr:${clientIp(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const domain = req.nextUrl.searchParams.get("domain") ?? "";
  const domains = req.nextUrl.searchParams.get("domains") ?? domain;
  return handle(domains);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`dr:${clientIp(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const domains =
    typeof record.domains === "string"
      ? record.domains
      : typeof record.domain === "string"
        ? record.domain
        : Array.isArray(record.domains)
          ? (record.domains as unknown[]).map(String).join(",")
          : "";

  return handle(domains);
}
