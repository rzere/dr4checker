/**
 * Normalize and validate a user-supplied domain or URL.
 * Strips protocol, path, port, userinfo, and trailing dots.
 * Lowercases the host. Punycode (xn--) labels are accepted as-is.
 */

export type DomainParseResult =
  | { ok: true; host: string }
  | { ok: false; error: string };

const MAX_HOST_LENGTH = 253;
const LABEL_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)$/;
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function extractHost(rawInput: string): DomainParseResult {
  let raw = rawInput.trim();
  if (!raw) {
    return { ok: false, error: "Enter a domain." };
  }

  if (raw.startsWith("[") && raw.includes("]")) {
    return { ok: false, error: "Enter a domain name, not an IP address." };
  }

  // Only treat real URL schemes as schemes. Avoid mistaking host:port for a scheme.
  if (/^(https?):\/\//i.test(raw)) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return { ok: false, error: "That does not look like a valid domain." };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: "Only http and https domains are supported." };
    }
    return { ok: true, host: url.hostname };
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    return { ok: false, error: "Only http and https domains are supported." };
  }

  // Strip credentials, path, query, hash from a bare host-ish string.
  let hostish = raw.split("/")[0] ?? "";
  hostish = hostish.split("?")[0] ?? "";
  hostish = hostish.split("#")[0] ?? "";
  if (hostish.includes("@")) {
    hostish = hostish.split("@").pop() ?? "";
  }

  // Strip trailing dots, then a trailing :port. Keep IPv6 rejection via colon check later.
  hostish = hostish.replace(/\.+$/, "");
  hostish = hostish.replace(/:\d+$/, "");

  return { ok: true, host: hostish };
}

export function normalizeDomain(input: string): DomainParseResult {
  if (typeof input !== "string") {
    return { ok: false, error: "Enter a domain." };
  }

  const extracted = extractHost(input);
  if (!extracted.ok) return extracted;

  let host = extracted.host.toLowerCase().replace(/\.+$/, "");

  if (!host) {
    return { ok: false, error: "Enter a domain." };
  }

  if (host.length > MAX_HOST_LENGTH) {
    return { ok: false, error: "That domain is too long." };
  }

  if (host === "localhost" || IPV4_RE.test(host) || host.includes(":")) {
    return {
      ok: false,
      error: "Enter a public domain name, not localhost or an IP.",
    };
  }

  const labels = host.split(".");
  if (labels.length < 2) {
    return { ok: false, error: "Include a top-level domain, like example.com." };
  }

  for (const label of labels) {
    if (!label || label.length > 63) {
      return { ok: false, error: "That does not look like a valid domain." };
    }
    if (label.startsWith("xn--")) {
      if (!/^xn--[a-z0-9-]+$/.test(label) || label.length < 5) {
        return { ok: false, error: "That does not look like a valid domain." };
      }
      continue;
    }
    if (!LABEL_RE.test(label)) {
      return { ok: false, error: "That does not look like a valid domain." };
    }
  }

  const tld = labels[labels.length - 1];
  if (/^\d+$/.test(tld)) {
    return { ok: false, error: "That does not look like a valid domain." };
  }

  return { ok: true, host };
}

export function parseDomainList(
  input: string,
  max = 5,
): DomainParseResult & { hosts?: string[] } {
  const parts = input
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { ok: false, error: "Enter at least one domain." };
  }

  const hosts: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const parsed = normalizeDomain(part);
    if (!parsed.ok) {
      return { ok: false, error: `${part}: ${parsed.error}` };
    }
    if (!seen.has(parsed.host)) {
      seen.add(parsed.host);
      hosts.push(parsed.host);
    }
  }

  if (hosts.length > max) {
    return { ok: false, error: `Compare up to ${max} domains at a time.` };
  }

  return { ok: true, host: hosts[0], hosts };
}
