import Link from "next/link";
import { SmartImage } from "@/components/SmartImage";
import {
  getHomePageData as getFirestoreHomePageData,
  listPublishedForLatest,
  listPublishedForTrending,
} from "@/lib/firestore";

export const revalidate = 300;

async function getHomePageData() {
  const [homeData, latestData, trendingData] = await Promise.all([
    getFirestoreHomePageData(),
    listPublishedForLatest(1, 4),
    listPublishedForTrending(1, 4),
  ]);

  const { featuredArticles, latestArticles } = homeData;

  return {
    featuredArticles,
    latestArticles,
    latestSectionArticles: latestData.items,
    trendingSectionArticles: trendingData.items,
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

function Byline({ article }: { article: { publishedAt?: Date | string; authorId?: unknown; authorName?: string } }) {
  const author =
    (article.authorId as { name?: string } | undefined)?.name ??
    article.authorName ??
    null;
  const time = formatRelativeTime(article.publishedAt);
  if (!author && !time) return null;
  return (
    <p className="mt-2 text-xs text-neutral-500">
      {author && <span>By {author}</span>}
      {author && time && <span> · </span>}
      {time && <span>{time}</span>}
    </p>
  );
}

export default async function HomePage() {
  const {
    featuredArticles,
    latestArticles,
    latestSectionArticles,
    trendingSectionArticles,
  } = await getHomePageData();
  const allArticles = [...featuredArticles, ...latestArticles];
  const uniqueArticles = Array.from(
    new Map(allArticles.map((article) => [article._id, article])).values(),
  );

  const heroArticle = uniqueArticles[0];
  const secondLead = uniqueArticles[1];
  const middleLeads = uniqueArticles.slice(2, 5);
  const rightRail = uniqueArticles.slice(5, 9);
  const hasArticles = uniqueArticles.length > 0;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {!hasArticles && (
          <section className="border border-neutral-200 px-6 py-10 text-center">
            <h1 className="font-display text-2xl font-bold text-neutral-900">No published stories yet</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Publish an article from the admin dashboard and it will appear here.
            </p>
          </section>
        )}

        {heroArticle && (
          <section className={`grid gap-8 border-b border-neutral-200 pb-8 ${getImageUrl(heroArticle) ? "md:grid-cols-[1fr_1.4fr]" : ""}`}>
            <article>
              <p className="kicker">
                <Link href={`/category/${heroArticle.category.toLowerCase().replace(/ /g, "-")}`} className="hover:text-black">
                  {heroArticle.category}
                </Link>
              </p>
              <Link href={`/article/${heroArticle.slug}`} className="headline-link mt-3 block">
                <h1 className="font-display text-3xl font-black leading-[1.08] text-neutral-900 md:text-4xl">
                  {heroArticle.title}
                </h1>
              </Link>
              <p className="mt-4 text-[15px] leading-7 text-neutral-700">
                {heroArticle.summary}
              </p>
              <Byline article={heroArticle} />
            </article>

            {getImageUrl(heroArticle) && (
              <Link
                href={`/article/${heroArticle.slug}`}
                className="block h-[260px] overflow-hidden md:h-[400px]"
                aria-label={heroArticle.title}
              >
                <SmartImage
                  src={getImageUrl(heroArticle)}
                  alt={heroArticle.title}
                  eager
                />
              </Link>
            )}
          </section>
        )}

        {(secondLead || middleLeads.length > 0 || rightRail.length > 0) && (
          <section className="grid gap-10 pt-8 lg:grid-cols-[1fr_1.2fr_0.9fr]">
            <div>
              {secondLead && (
                <article className="border-b border-neutral-200 pb-6">
                  <p className="kicker">{secondLead.category}</p>
                  <Link href={`/article/${secondLead.slug}`} className="headline-link mt-2 block">
                    <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900 md:text-[1.7rem]">
                      {secondLead.title}
                    </h2>
                  </Link>
                  <p className="mt-3 text-sm leading-6 text-neutral-700 line-clamp-4">
                    {secondLead.summary}
                  </p>
                  <Byline article={secondLead} />
                </article>
              )}

              {middleLeads.map((article) => (
                <article key={article._id} className="border-b border-neutral-200 py-5 last:border-b-0">
                  <Link href={`/article/${article.slug}`} className="headline-link block">
                    <h3 className="font-display text-lg font-bold leading-snug text-neutral-900">
                      {article.title}
                    </h3>
                  </Link>
                  <Byline article={article} />
                </article>
              ))}
            </div>

            <div className="space-y-8">
              {uniqueArticles.slice(1, 3).map((article) => (
                <article key={`img-${article._id}`}>
                  {getImageUrl(article) && (
                    <Link
                      href={`/article/${article.slug}`}
                      className="block h-52 overflow-hidden"
                      aria-label={article.title}
                    >
                      <SmartImage
                        src={getImageUrl(article)}
                        alt={article.title}
                      />
                    </Link>
                  )}
                  <p className="kicker mt-3">{article.category}</p>
                  <Link href={`/article/${article.slug}`} className="headline-link mt-1 block">
                    <h3 className="font-display text-xl font-bold leading-snug text-neutral-900">
                      {article.title}
                    </h3>
                  </Link>
                  <Byline article={article} />
                </article>
              ))}
            </div>

            {rightRail.length > 0 && (
              <aside>
                <p className="kicker border-b border-neutral-900 pb-2">The Latest</p>
                <div>
                  {rightRail.map((article) => (
                    <article key={article._id} className="border-b border-neutral-200 py-4 last:border-b-0">
                      <Link href={`/article/${article.slug}`} className="headline-link block">
                        <h3 className="font-display text-[17px] font-bold leading-snug text-neutral-900">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatRelativeTime(article.publishedAt)}
                      </p>
                    </article>
                  ))}
                </div>
                <Link href="/latest" className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:text-black hover:underline underline-offset-4">
                  All latest →
                </Link>
              </aside>
            )}
          </section>
        )}

        {trendingSectionArticles.length > 0 && (
          <section className="mt-12 border-t-2 border-neutral-900 pt-6">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-black text-neutral-900">Most Read</h2>
              <Link
                href="/trending"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600 hover:text-black hover:underline underline-offset-4"
              >
                Full list →
              </Link>
            </div>

            <ol className="grid gap-x-10 md:grid-cols-2">
              {trendingSectionArticles.map((article, i) => (
                <li key={`trending-${article._id}`} className="flex gap-4 border-b border-neutral-200 py-4">
                  <span className="font-display text-3xl font-light text-neutral-300">{i + 1}</span>
                  <div>
                    <Link href={`/article/${article.slug}`} className="headline-link block">
                      <h3 className="font-display text-lg font-bold leading-snug text-neutral-900">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-neutral-500">
                      {article.category} · {(article.weeklyViews ?? 0).toLocaleString()} reads
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {latestSectionArticles.length > 0 && (
          <section className="mt-12 border-t-2 border-neutral-900 pt-6">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-black text-neutral-900">Latest</h2>
              <Link
                href="/latest"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600 hover:text-black hover:underline underline-offset-4"
              >
                Full list →
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {latestSectionArticles.map((article) => (
                <article key={`latest-${article._id}`}>
                  {getImageUrl(article) && (
                    <Link
                      href={`/article/${article.slug}`}
                      className="block h-36 overflow-hidden"
                      aria-label={article.title}
                    >
                      <SmartImage
                        src={getImageUrl(article)}
                        alt={article.title}
                      />
                    </Link>
                  )}
                  <p className="kicker mt-3">{article.category}</p>
                  <Link href={`/article/${article.slug}`} className="headline-link mt-1 block">
                    <h3 className="font-display text-[17px] font-bold leading-snug text-neutral-900">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatRelativeTime(article.publishedAt)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
