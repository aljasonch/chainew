import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { TrendingUp, ArrowUpRight, Newspaper, Eye, Crown } from "lucide-react";
import { listPublishedForTrending } from "@/lib/firestore";
import { IArticle } from "@/types";

const ITEMS_PER_PAGE = 10;

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

    let featuredArticle: IArticle | undefined;
    let remainingArticles: IArticle[];
    if (currentPage === 1 && articles.length > 1) {
        featuredArticle = articles[0];
        remainingArticles = articles.slice(1);
    } else {
        featuredArticle = undefined;
        remainingArticles = articles;
    }
    const startRank = (currentPage - 1) * ITEMS_PER_PAGE;

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-secondary py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-accent" size={32} />
                        <h1 className="text-4xl md:text-5xl font-black text-inverse animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                            Trending
                        </h1>
                    </div>
                    <p className="text-muted text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        The most popular stories based on reader views from the last 7 days
                    </p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="mx-auto text-secondary mb-4" size={48} />
                        <h2 className="text-xl font-bold text-primary mb-2">No Trending Articles</h2>
                        <p className="text-secondary">Check back soon for trending tech stories.</p>
                    </div>
                ) : (
                    <>
                        {featuredArticle && currentPage === 1 && (
                            <Link
                                href={`/article/${featuredArticle.slug}`}
                                className="group block mb-10 animate-fadeInUp"
                                style={{ animationFillMode: 'forwards' }}
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-secondary to-primary p-1">
                                    <div className="bg-card rounded-xl p-8 md:p-10 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full">
                                            <Crown className="text-accent" size={18} />
                                            <span className="text-accent font-bold text-sm">#1 TRENDING</span>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Badge variant="accent">{featuredArticle.category}</Badge>
                                                <span className="text-sm text-secondary flex items-center gap-1">
                                                    <Eye size={14} />
                                                    {featuredArticle.weeklyViews?.toLocaleString() || 0} views this week
                                                </span>
                                            </div>

                                            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 group-hover:text-accent transition-colors">
                                                {featuredArticle.title}
                                            </h2>

                                            <p className="text-secondary text-lg mb-6 line-clamp-3 max-w-3xl">
                                                {featuredArticle.summary}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-secondary">
                                                    By <span className="text-primary font-medium">{getArticleAuthorName(featuredArticle)}</span>
                                                </span>
                                                <span className="flex items-center gap-2 text-accent group-hover:translate-x-1 transition-transform font-medium">
                                                    Read Article
                                                    <ArrowUpRight size={20} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="space-y-4">
                            {(currentPage === 1 ? remainingArticles : articles).map((article: IArticle, index: number) => {
                                const rank = currentPage === 1 ? index + 2 : startRank + index + 1;
                                const isTopThree = rank <= 3;

                                return (
                                    <Link
                                        key={article._id}
                                        href={`/article/${article.slug}`}
                                        className="group flex items-start gap-6 bg-card border border-default rounded-xl p-6 hover-lift transition-all duration-200 animate-fadeInUp"
                                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                                    >
                                        <div className="shrink-0">
                                            <span className={`text-5xl font-black transition-colors ${isTopThree
                                                ? 'text-accent group-hover:text-primary'
                                                : 'text-muted group-hover:text-accent'
                                                }`}>
                                                {String(rank).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="accent">{article.category}</Badge>
                                                <span className="text-sm text-secondary flex items-center gap-1">
                                                    <Eye size={12} />
                                                    {article.weeklyViews?.toLocaleString() || 0}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors mb-2">
                                                {article.title}
                                            </h2>

                                            <p className="text-secondary line-clamp-2">
                                                {article.summary}
                                            </p>
                                        </div>

                                        <ArrowUpRight className="shrink-0 text-muted group-hover:text-accent transition-colors" size={24} />
                                    </Link>
                                );
                            })}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/trending"
                        />
                    </>
                )}
            </section>
        </div>
    );
}
