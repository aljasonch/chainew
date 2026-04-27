import Link from "next/link";
import { getHomePageData as getFirestoreHomePageData } from "@/lib/firestore";

export const dynamic = "force-dynamic";

async function getHomePageData() {
  const { featuredArticles, latestArticles } =
    await getFirestoreHomePageData();

  return {
    featuredArticles,
    latestArticles,
  };
}

function formatRelativeTime(date?: Date | string) {
  if (!date) return "";

  const published = new Date(date);
  if (Number.isNaN(published.getTime())) return "";

  const diffMs = Date.now() - published.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getImageUrl(article?: { seo?: { ogImageUrl?: string } }) {
  return article?.seo?.ogImageUrl || null;
}

export default async function HomePage() {
  const { featuredArticles, latestArticles } = await getHomePageData();
  const allArticles = [...featuredArticles, ...latestArticles];
  const uniqueArticles = Array.from(
    new Map(allArticles.map((article) => [article._id, article])).values(),
  );

  const heroArticle = uniqueArticles[0];
  const secondLead = uniqueArticles[1];
  const visualLead = uniqueArticles[2];
  const rightRail = uniqueArticles.slice(3, 7);
  const hasArticles = uniqueArticles.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {!hasArticles && (
          <section className="rounded-md border border-neutral-300 bg-white px-6 py-10 text-center">
            <h1 className="text-2xl font-semibold text-neutral-900">No published stories yet</h1>
            <p className="mt-2 text-neutral-600">
              Publish an article from the admin dashboard and it will appear on the home page.
            </p>
          </section>
        )}

        {heroArticle && (
          <section className="grid gap-6 border-b border-neutral-300 pb-8 md:grid-cols-[0.95fr_1.35fr] md:items-start">
            <article className="order-2 md:order-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                {heroArticle.category}
              </p>
              <Link href={`/article/${heroArticle.slug}`} className="group block">
                <h1 className="mt-2 text-[1.65rem] font-extrabold leading-[1.1] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[1.9rem] lg:text-[2.2rem]">
                  {heroArticle.title}
                </h1>
              </Link>
              <p className="mt-4 text-base leading-7 text-neutral-700 md:text-sm md:leading-6">
                {heroArticle.summary}
              </p>
              {heroArticle.publishedAt && (
                <p className="mt-2 text-sm text-neutral-500">{formatRelativeTime(heroArticle.publishedAt)}</p>
              )}
            </article>

            <Link
              href={`/article/${heroArticle.slug}`}
              className="order-1 block overflow-hidden rounded-sm bg-neutral-200 md:order-2"
            >
              {getImageUrl(heroArticle) ? (
                <img
                  src={getImageUrl(heroArticle) as string}
                  alt={heroArticle.title}
                  className="h-[250px] w-full object-cover md:h-[420px]"
                />
              ) : (
                <div className="flex h-[250px] w-full items-center justify-center bg-neutral-300 text-sm font-medium text-neutral-600 md:h-[420px]">
                  Image unavailable
                </div>
              )}
            </Link>
          </section>
        )}

        {(secondLead || visualLead || rightRail.length > 0) && (
          <section className="grid gap-6 pt-6 lg:grid-cols-[1fr_1.25fr_1.05fr]">
            {secondLead && (
              <article>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                  {secondLead.category}
                </p>
                <Link href={`/article/${secondLead.slug}`} className="group block">
                  <h2 className="mt-2 text-[1.6rem] font-extrabold leading-[1.1] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[1.85rem] lg:text-[2.1rem]">
                    {secondLead.title}
                  </h2>
                </Link>
                <p className="mt-4 text-sm leading-6 text-neutral-700">
                  {secondLead.summary}
                </p>
                {secondLead.publishedAt && (
                  <p className="mt-2 text-sm text-neutral-500">{formatRelativeTime(secondLead.publishedAt)}</p>
                )}
              </article>
            )}

            {visualLead && (
              <article>
                <Link
                  href={`/article/${visualLead.slug}`}
                  className="group relative block h-[320px] overflow-hidden rounded-sm bg-neutral-900"
                >
                  {getImageUrl(visualLead) ? (
                    <img
                      src={getImageUrl(visualLead) as string}
                      alt={visualLead.title}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-700 text-sm font-medium text-neutral-200">
                      Image unavailable
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                    <h3 className="text-base font-bold leading-tight text-white md:text-lg">
                      {visualLead.title}
                    </h3>
                    {visualLead.publishedAt && (
                      <p className="mt-2 text-sm text-neutral-200">
                        {formatRelativeTime(visualLead.publishedAt)}
                      </p>
                    )}
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                </Link>
              </article>
            )}

            {rightRail.length > 0 && (
              <aside className="flex flex-col">
                {rightRail.map((article) => (
                  <article key={article._id} className="border-b border-neutral-300 py-4 first:pt-0 last:border-b-0">
                    <Link href={`/article/${article.slug}`} className="group block">
                      <h3 className="text-base font-bold leading-[1.2] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[1.3rem] md:leading-[1.24]">
                        {article.title}
                      </h3>
                    </Link>
                    {article.publishedAt && (
                      <p className="mt-2 text-sm text-neutral-500">
                        {formatRelativeTime(article.publishedAt)}
                      </p>
                    )}
                  </article>
                ))}
              </aside>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
