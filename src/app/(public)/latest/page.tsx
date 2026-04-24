import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Clock, ArrowRight, Newspaper, ArrowUpRight } from "lucide-react";
import { listPublishedForLatest } from "@/lib/firestore";
import { formatDateShort } from "@/lib/utils";
import { IArticle } from "@/types";

const ITEMS_PER_PAGE = 10;

async function getLatestArticles(page: number) {
    const { items: articles, total } = await listPublishedForLatest(page, ITEMS_PER_PAGE);

    return {
        articles,
        total,
        totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
    };
}

interface LatestPageProps {
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

export default async function LatestPage({ searchParams }: LatestPageProps) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || "1") || 1);
    const { articles, totalPages } = await getLatestArticles(currentPage);

    let featuredArticle: IArticle | undefined;
    let remainingArticles: IArticle[];
    if (currentPage === 1 && articles.length > 1) {
        featuredArticle = articles[0];
        remainingArticles = articles.slice(1);
    } else {
        featuredArticle = undefined;
        remainingArticles = articles;
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-primary py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black text-inverse mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                        Latest News
                    </h1>
                    <p className="text-muted text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        Stay up to date with the most recent stories from around the world
                    </p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="mx-auto text-secondary mb-4" size={48} />
                        <h2 className="text-xl font-bold text-primary mb-2">No Articles Yet</h2>
                        <p className="text-secondary">Check back soon for the latest news.</p>
                    </div>
                ) : (
                    <>
                        {featuredArticle && currentPage === 1 && (
                            <Link
                                href={`/article/${featuredArticle.slug}`}
                                className="group block mb-10 animate-fadeInUp"
                                style={{ animationFillMode: 'forwards' }}
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 hover-lift transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Badge variant="secondary">{featuredArticle.category}</Badge>
                                            {featuredArticle.publishedAt && (
                                                <span className="text-sm text-muted flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {formatDateShort(featuredArticle.publishedAt)}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-accent/20 text-[var(--color-muted)] text-xs font-semibold rounded-full uppercase tracking-wide">
                                                Latest
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-black text-inverse mb-4 group-hover:text-muted transition-colors">
                                            {featuredArticle.title}
                                        </h2>

                                        <p className="text-muted text-lg mb-6 line-clamp-3 max-w-3xl">
                                            {featuredArticle.summary}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted">
                                                By <span className="text-inverse font-medium">{getArticleAuthorName(featuredArticle)}</span>
                                            </span>
                                            <span className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform">
                                                Read Full Story
                                                <ArrowUpRight size={20} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="space-y-6">
                            {(currentPage === 1 ? remainingArticles : articles).map((article: IArticle, index: number) => (
                                <Link
                                    key={article._id}
                                    href={`/article/${article.slug}`}
                                    className="block bg-card border border-default rounded-xl p-6 hover-lift transition-all duration-200 animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Badge variant="accent">{article.category}</Badge>
                                                {article.publishedAt && (
                                                    <span className="text-sm text-secondary flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatDateShort(article.publishedAt)}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-xl font-bold text-primary hover:text-secondary transition-colors mb-2">
                                                {article.title}
                                            </h2>

                                            <p className="text-secondary line-clamp-2 mb-3">
                                                {article.summary}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-secondary">
                                                    By <span className="text-primary font-medium">{getArticleAuthorName(article)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <ArrowRight className="hidden md:block text-secondary shrink-0" size={24} />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/latest"
                        />
                    </>
                )}
            </section>
        </div>
    );
}
