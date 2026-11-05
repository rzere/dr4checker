export type DrVersion = "dr3" | "dr4";

export type DrFetchResult =
  | { ok: true; rating: number | null; license?: string }
  | { ok: false; status: number; error: string };

const AHREFS_URL = "https://api.ahrefs.com/v3/public/domain-rating-free";
const REVALIDATE_SECONDS = 60 * 60 * 24; // ~24h

/** Deterministic mock ratings for local demos without a key. */
function mockRating(host: string, version: DrVersion): number {
  let hash = 0;
  for (let i = 0; i < host.length; i++) {
    hash = (hash * 31 + host.charCodeAt(i)) >>> 0;
  }
  const base = 20 + (hash % 60);
  if (version === "dr4") {
    // Bias toward a drop so demos look like the real DR4 shift.
    const drop = 5 + (hash % 20);
    return Math.max(0, Math.round((base - drop) * 10) / 10);
  }
  return Math.round(base * 10) / 10;
}

function parseRating(payload: unknown): { rating: number | null; license?: string } | null {
  if (!payload || typeof payload !== "object") return null;

  // Documented success shape: { domain_rating: { domain_rating: number, license: string } }
  const root = payload as Record<string, unknown>;
  const inner = root.domain_rating;

  if (inner && typeof inner === "object") {
    const dr = inner as Record<string, unknown>;
    const license = typeof dr.license === "string" ? dr.license : undefined;

    if (typeof dr.domain_rating === "number" && Number.isFinite(dr.domain_rating)) {
      return { rating: dr.domain_rating, license };
    }

    // Some responses may omit the score for unrated hosts.
    if (dr.domain_rating === null || dr.domain_rating === undefined) {
      return { rating: null, license };
    }
  }

  // Error array shape seen without a key: ["Error","Forbidden"]
  if (Array.isArray(payload)) {
    return null;
  }

  return null;
}

export async function fetchDomainRating(
  host: string,
  version: DrVersion,
): Promise<DrFetchResult> {
  if (process.env.MOCK_AHREFS === "1") {
    return { ok: true, rating: mockRating(host, version) };
  }

  const apiKey = process.env.AHREFS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "This checker is not configured yet. Missing AHREFS_API_KEY.",
    };
  }

  const url = new URL(AHREFS_URL);
  url.searchParams.set("target", host);
  url.searchParams.set("version", version);
  url.searchParams.set("output", "json");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return { ok: false, status: 502, error: "Could not reach Ahrefs right now." };
  }

  if (response.status === 429) {
    return { ok: false, status: 429, error: "Ahrefs rate limit hit. Try again in a minute." };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      status: 503,
      error: "Ahrefs rejected the API key. Check AHREFS_API_KEY.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: `Ahrefs returned HTTP ${response.status}.`,
    };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { ok: false, status: 502, error: "Ahrefs returned an unreadable response." };
  }

  // Defensive: some error bodies are JSON arrays.
  if (Array.isArray(json)) {
    const msg = json.map(String).join(": ");
    return { ok: false, status: 502, error: msg || "Ahrefs returned an error." };
  }

  const parsed = parseRating(json);
  if (!parsed) {
    return { ok: false, status: 502, error: "Could not parse the Ahrefs response." };
  }

  return { ok: true, rating: parsed.rating, license: parsed.license };
}

export type DomainDrPair = {
  domain: string;
  dr3: number | null;
  dr4: number | null;
  change: number | null;
};

export async function fetchDrPair(host: string): Promise<
  | { ok: true; data: DomainDrPair }
  | { ok: false; status: number; error: string }
> {
  const [dr3, dr4] = await Promise.all([
    fetchDomainRating(host, "dr3"),
    fetchDomainRating(host, "dr4"),
  ]);

  if (!dr3.ok) return dr3;
  if (!dr4.ok) return dr4;

  const change =
    dr3.rating !== null && dr4.rating !== null
      ? Math.round((dr4.rating - dr3.rating) * 10) / 10
      : null;

  return {
    ok: true,
    data: {
      domain: host,
      dr3: dr3.rating,
      dr4: dr4.rating,
      change,
    },
  };
}
