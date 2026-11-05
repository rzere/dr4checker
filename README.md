# DR4 Checker

Compare a domain's current Ahrefs Domain Rating (DR3) with the new DR4 model before Ahrefs switches its UI on December 1, 2026.

Live site: [https://dr4checker.com](https://dr4checker.com)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Zero-config deploy on Vercel

## Environment

Copy `.env.example` to `.env.local` and set:

```
AHREFS_API_KEY=your_free_ahrefs_apiv3_key
```

Get a free key: create a free Ahrefs account, then Account settings, then API keys.

Optional for local demos without a key:

```
MOCK_AHREFS=1
```

## Develop

```bash
npm install
npm run dev
```

## Test and build

```bash
npm test
npm run build
```

## Notes

- Results are cached for about 24 hours (`fetch` revalidate).
- The API route uses a simple in-memory per-IP rate limit. On serverless this is best-effort per instance, not a shared store.
- Domain Rating data is subject to the [Ahrefs Domain Rating License](http://ahrefs.com/legal/domain-rating-license). Attribution: Domain Rating by Ahrefs.
- Not affiliated with Ahrefs.

## License

MIT. Copyright (c) 2026 Ruzgar Zere.
