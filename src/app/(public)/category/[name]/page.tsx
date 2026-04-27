import Link from "next/link";
import { Metadata } from "next";
import { listPublishedByCategory } from "@/lib/firestore";
import { Pagination } from "@/components/ui/Pagination";
import { IArticle } from "@/types";

const ITEMS_PER_PAGE = 18;

interface PageProps {
    params: Promise<{ name: string }>;
    searchParams: Promise<{ page?: string }>;
}

const categoryMapping: Record<string, string> = {
    "tech": "Tech",
    "ai-ml": "Tech",
    "finance": "Finance",
    "blockchain": "Blockchain",
    "public-affairs": "Public Affairs",
};

function formatLongDate(date?: Date | string): string {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatRelativeOrDate(date?: Date | string): string {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const diffMs = Date.now() - parsedDate.getTime();
    if (diffMs < 0) return formatLongDate(parsedDate);

    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    return formatLongDate(parsedDate);
}

function getImageUrl(article: IArticle): string | null {
    return article.seo?.ogImageUrl ?? null;
}

function groupArticlesBy<T>(items: T[], size: number): T[][] {
    const groups: T[][] = [];

    for (let i = 0; i < items.length; i += size) {
        groups.push(items.slice(i, i + size));
    }

    return groups;
}

async function getArticlesByCategory(slug: string, page: number) {
    const categoryName = categoryMapping[slug.toLowerCase()] || decodeURIComponent(slug);
    const { items: articles, total } = await listPublishedByCategory(
        categoryName,
        page,
        ITEMS_PER_PAGE,
    );

    return {
        articles,
        categoryName,
        total,
        totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
    };
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { name } = await params;
    const categoryName = categoryMapping[name.toLowerCase()] || decodeURIComponent(name);

    return {
        title: `${categoryName} News`,
        description: `Latest news and updates in ${categoryName}`,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { name } = await params;
    const query = await searchParams;
    const currentPage = Math.max(1, parseInt(query.page || "1") || 1);
    const { articles, categoryName, total, totalPages } = await getArticlesByCategory(name, currentPage);

    const heroArticle = articles[0];
    const topStripArticles = articles.slice(1, 4);
    const fourColumnSeed = articles.slice(4, 12);
    const fourColumnGroups = groupArticlesBy(fourColumnSeed, 2);
    const listStories = articles.slice(12);

    return (
        <div className="bg-white">
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
                <header className="mb-8 border-b border-neutral-300 pb-4">
                    <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                        {categoryName}
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        {total} {total === 1 ? "story" : "stories"}
                    </p>
                </header>

                {total === 0 ? (
                    <div className="rounded-md border border-neutral-300 bg-white px-6 py-16 text-center">
                        <p className="text-neutral-600">No articles found in this category.</p>
                    </div>
                ) : (
                    <>
                        {heroArticle && (
                            <section className="grid gap-6 md:grid-cols-[1fr_1.9fr] md:items-start">
                                <article>
                                    <Link href={`/article/${heroArticle.slug}`} className="group block">
                                        <h2 className="text-[1.85rem] font-bold leading-[1.1] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[2.45rem]">
                                            {heroArticle.title}
                                        </h2>
                                    </Link>
                                    <p className="mt-4 text-base leading-7 text-neutral-700 line-clamp-5 md:text-[1.05rem]">
                                        {heroArticle.summary}
                                    </p>
                                    {heroArticle.publishedAt && (
                                        <p className="mt-3 text-sm text-neutral-500">
                                            {formatRelativeOrDate(heroArticle.publishedAt)}
                                        </p>
                                    )}
                                </article>

                                <Link
                                    href={`/article/${heroArticle.slug}`}
                                    className="block overflow-hidden bg-neutral-200"
                                >
                                    {getImageUrl(heroArticle) ? (
                                        <img
                                            src={getImageUrl(heroArticle) as string}
                                            alt={heroArticle.title}
                                            className="h-[280px] w-full object-cover md:h-[390px]"
                                        />
                                    ) : (
                                        <div className="flex h-[280px] w-full items-center justify-center bg-neutral-300 text-sm font-medium text-neutral-600 md:h-[390px]">
                                            Image unavailable
                                        </div>
                                    )}
                                </Link>
                            </section>
                        )}

                        {topStripArticles.length > 0 && (
                            <section className="mt-6 grid gap-6 border-b border-neutral-300 pb-6 md:grid-cols-3">
                                {topStripArticles.map((article) => (
                                    <article key={article._id}>
                                        <Link href={`/article/${article.slug}`} className="group block">
                                            <h3 className="text-[1.45rem] font-bold leading-[1.14] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[1.65rem]">
                                                {article.title}
                                            </h3>
                                        </Link>
                                        {article.publishedAt && (
                                            <p className="mt-2 text-sm text-neutral-500">
                                                {formatRelativeOrDate(article.publishedAt)}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </section>
                        )}

                        {fourColumnGroups.length > 0 && (
                            <section className="mt-5 border-b border-neutral-300 pb-6">
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                    {fourColumnGroups.map((group, columnIndex) => {
                                        const firstArticle = group[0];
                                        const secondArticle = group[1];

                                        if (!firstArticle) {
                                            return null;
                                        }

                                        return (
                                            <div key={`${firstArticle._id}-${columnIndex}`} className="space-y-3">
                                                <Link
                                                    href={`/article/${firstArticle.slug}`}
                                                    className="block overflow-hidden bg-neutral-200"
                                                >
                                                    {getImageUrl(firstArticle) ? (
                                                        <img
                                                            src={getImageUrl(firstArticle) as string}
                                                            alt={firstArticle.title}
                                                            className="h-[180px] w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-[180px] w-full items-center justify-center bg-neutral-300 text-sm font-medium text-neutral-600">
                                                            Image unavailable
                                                        </div>
                                                    )}
                                                </Link>

                                                <div>
                                                    <Link href={`/article/${firstArticle.slug}`} className="group block">
                                                        <h3 className="text-[1.3rem] font-bold leading-[1.16] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-[1.45rem]">
                                                            {firstArticle.title}
                                                        </h3>
                                                    </Link>
                                                    {firstArticle.publishedAt && (
                                                        <p className="mt-1 text-sm text-neutral-500">
                                                            {formatRelativeOrDate(firstArticle.publishedAt)}
                                                        </p>
                                                    )}
                                                </div>

                                                {secondArticle && (
                                                    <div className="border-t border-neutral-300 pt-3">
                                                        <Link href={`/article/${secondArticle.slug}`} className="group block">
                                                            <h4 className="text-xl font-bold leading-[1.18] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-2xl">
                                                                {secondArticle.title}
                                                            </h4>
                                                        </Link>
                                                        {secondArticle.publishedAt && (
                                                            <p className="mt-1 text-sm text-neutral-500">
                                                                {formatRelativeOrDate(secondArticle.publishedAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {listStories.length > 0 && (
                            <section className="mt-5">
                                <div className="divide-y divide-neutral-300">
                                    {listStories.map((article) => (
                                        <article
                                            key={article._id}
                                            className="grid gap-5 py-6 md:grid-cols-[1.45fr_0.95fr] md:items-start"
                                        >
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                    {categoryName}
                                                    {article.publishedAt && ` • ${formatLongDate(article.publishedAt)}`}
                                                </p>
                                                <Link href={`/article/${article.slug}`} className="group block">
                                                    <h3 className="mt-2 text-xl font-bold leading-[1.14] text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-3xl">
                                                        {article.title}
                                                    </h3>
                                                </Link>
                                                <p className="mt-3 text-base leading-7 text-neutral-700 line-clamp-3">
                                                    {article.summary}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/article/${article.slug}`}
                                                className="block overflow-hidden bg-neutral-200"
                                            >
                                                {getImageUrl(article) ? (
                                                    <img
                                                        src={getImageUrl(article) as string}
                                                        alt={article.title}
                                                        className="h-[180px] w-full object-cover md:h-[210px]"
                                                    />
                                                ) : (
                                                    <div className="flex h-[180px] w-full items-center justify-center bg-neutral-300 text-sm font-medium text-neutral-600 md:h-[210px]">
                                                        Image unavailable
                                                    </div>
                                                )}
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        {articles.length === 0 && total > 0 && (
                            <p className="mt-8 text-center text-zinc-500">
                                No articles on this page.
                            </p>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath={`/category/${encodeURIComponent(name)}`}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
