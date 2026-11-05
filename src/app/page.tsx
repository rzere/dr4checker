import { Checker } from "@/components/Checker";
import { Explainer } from "@/components/Explainer";

export default function HomePage() {
  return (
    <>
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- reuse the app/icon.svg route */}
            <img src="/icon.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              DR4 Checker
            </span>
          </div>
          <p className="text-xs text-zinc-500">Preview before Dec 1, 2026</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">Free Ahrefs DR preview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            See your Domain Rating under DR4
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600">
            Ahrefs rolls DR4 into its UI on December 1, 2026. Check a domain&apos;s
            current score next to the new model, and optionally compare up to five
            domains side by side.
          </p>
        </div>

        <div className="mt-8">
          <Checker />
        </div>

        <div className="mt-10">
          <Explainer />
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <a
              href="https://ahrefs.com"
              className="font-medium text-zinc-700 underline-offset-2 hover:underline"
              rel="noopener noreferrer"
            >
              Domain Rating by Ahrefs
            </a>
            . Not affiliated with Ahrefs.
          </p>
          <p>
            Built by{" "}
            <a
              href="https://leadshark.io"
              className="font-medium text-zinc-700 underline-offset-2 hover:underline"
              rel="noopener noreferrer"
            >
              LeadShark
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
