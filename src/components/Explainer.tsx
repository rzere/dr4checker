export function Explainer() {
  return (
    <section
      aria-labelledby="what-is-dr4"
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id="what-is-dr4" className="text-lg font-semibold text-zinc-900">
        What is DR4?
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600">
        <p>
          Domain Rating (DR) is Ahrefs&apos; link-based score of a site&apos;s
          backlink profile on a 100-point logarithmic scale. DR4 is the next
          version of that model.
        </p>
        <p>
          Ahrefs says DR4 puts more weight on links from sites (and their
          subdomains) estimated to have organic search traffic, which shrinks
          the pool of domains that can influence scores. Spam-labeled domains
          drop more, and subdomains no longer inherit the root domain&apos;s
          rating. They get their own score.
        </p>
        <p>
          The Ahrefs UI switches to DR4 on December 1, 2026. Until then you can
          preview DR4 through Ahrefs&apos; free Domain Rating API. Source:{" "}
          <a
            href="https://ahrefs.com/blog/domain-rating-dr4/"
            className="font-medium text-zinc-800 underline-offset-2 hover:underline"
            rel="noopener noreferrer"
          >
            Ahrefs&apos; DR4 announcement
          </a>
          .
        </p>
        <p>
          A lower DR is not a judgment on content quality. It only reflects how
          Ahrefs now weighs the link profile relative to other sites in its
          database.
        </p>
      </div>
    </section>
  );
}
