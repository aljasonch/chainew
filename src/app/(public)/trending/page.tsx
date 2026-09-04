import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { listPublishedForTrending } from "@/lib/firestore";
import { IArticle } from "@/types";

const ITEMS_PER_PAGE = 10;

// Served from cache per URL; regenerated at most once every 5 minutes.
export const revalidate = 300;

async function getTrendingArticles(page: number) {
    const { items: articles, total } = await listPublishedForTrending(page, ITEMS_PER_PAGE);

    return {
        articles,
        total,
        totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
    };
}

interface TrendingPageProps {
    searchParams: Promise<{ page?: string }>;
}

function getArticleAuthorName(article: IArticle): string {
    if (article.authorId && typeof article.authorId === "object" && article.authorId.name) {
        return article.authorId.name;
    }

    if (article.authorName) {
        return article.authorName;
    }

    return "Chainew";
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || "1") || 1);
    const { articles, totalPages } = await getTrendingArticles(currentPage);
    const startRank = (currentPage - 1) * ITEMS_PER_PAGE;

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
                <p className="kicker">Ranked by readers</p>
                <h1 className="font-display mt-2 text-3xl font-black text-neutral-900 md:text-4xl">
                    Most Read
                </h1>
                <p className="mt-3 border-b-2 border-neutral-900 pb-6 text-[15px] leading-7 text-neutral-600">
                    The most-read stories of the last 7 days, ranked by reader views.
                </p>

                {articles.length === 0 ? (
                    <div className="py-16 text-center">
                        <h2 className="font-display text-xl font-bold text-neutral-900">Nothing trending yet</h2>
                        <p className="mt-2 text-sm text-neutral-600">Check back soon.</p>
                    </div>
                ) : (
                    <>
                        <ol>
                            {articles.map((article: IArticle, index: number) => {
                                const rank = startRank + index + 1;
                                return (
                                    <li key={article._id} className="flex gap-5 border-b border-neutral-200 py-6">
                                        <span className="font-display w-10 shrink-0 text-4xl font-light text-neutral-300">
                                            {rank}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="kicker">
                                                {article.category}
                                                <span className="ml-2 font-medium normal-case tracking-normal text-neutral-400">
                                                    {article.weeklyViews?.toLocaleString() || 0} reads
                                                </span>
                                            </p>
                                            <Link href={`/article/${article.slug}`} className="headline-link mt-2 block">
                                                <h2 className="font-display text-[1.45rem] font-bold leading-tight text-neutral-900">
                                                    {article.title}
                                                </h2>
                                            </Link>
                                            <p className="mt-2 text-[15px] leading-7 text-neutral-700 line-clamp-2">
                                                {article.summary}
                                            </p>
                                            <p className="mt-2 text-xs text-neutral-500">
                                                By {getArticleAuthorName(article)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/trending"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
