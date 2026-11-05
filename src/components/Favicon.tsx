"use client";

import { useState } from "react";

function letterFor(domain: string): string {
  const base = domain.replace(/^www\./i, "");
  const ch = base.charAt(0).toUpperCase();
  return /[A-Z0-9]/i.test(ch) ? ch : "?";
}

export function Favicon({
  domain,
  size = 22,
  className = "",
}: {
  domain: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const letter = letterFor(domain);
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

  if (failed) {
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-md bg-zinc-200 font-semibold text-zinc-600 ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.45) }}
      >
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-md object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
