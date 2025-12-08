import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Clock, ArrowRight, Newspaper } from "lucide-react";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import "@/models/User";
import { formatDateShort } from "@/lib/utils";

async function getLatestArticles() {
    await dbConnect();

    const articles = await Article.find({ status: "published" })
        .populate("authorId", "name")
        .sort({ publishedAt: -1 })
        .limit(20)
        .lean();

    return JSON.parse(JSON.stringify(articles));
}

export default async function LatestPage() {
    const articles = await getLatestArticles();

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-primary py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black text-inverse mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                        Latest Tech News
                    </h1>
                    <p className="text-muted text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        Stay up to date with the most recent stories from the tech world
                    </p>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="mx-auto text-secondary mb-4" size={48} />
                        <h2 className="text-xl font-bold text-primary mb-2">No Articles Yet</h2>
                        <p className="text-secondary">Check back soon for the latest tech news.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {articles.map((article: { _id: string; slug: string; category: string; publishedAt?: string; title: string; summary: string; authorId?: { name?: string } }, index: number) => (
                            <Link
                                key={article._id}
                                href={`/article/${article.slug}`}
                                className="block bg-card border border-default rounded-xl p-6 hover-lift transition-all duration-200 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
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
                                                By <span className="text-primary font-medium">{article.authorId?.name || 'Chainew'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowRight className="hidden md:block text-secondary shrink-0" size={24} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
