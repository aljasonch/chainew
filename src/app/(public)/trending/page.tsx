import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, ArrowUpRight, Newspaper } from "lucide-react";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import "@/models/User";

async function getTrendingArticles() {
    await dbConnect();

    const articles = await Article.find({ status: "published" })
        .populate("authorId", "name")
        .sort({ publishedAt: -1 })
        .limit(10)
        .lean();

    return JSON.parse(JSON.stringify(articles));
}

export default async function TrendingPage() {
    const articles = await getTrendingArticles();

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-secondary py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="text-muted" size={32} />
                        <h1 className="text-4xl md:text-5xl font-black text-inverse animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                            Trending
                        </h1>
                    </div>
                    <p className="text-muted text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        The most popular stories people can&apos;t stop talking about
                    </p>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="mx-auto text-secondary mb-4" size={48} />
                        <h2 className="text-xl font-bold text-primary mb-2">No Trending Articles</h2>
                        <p className="text-secondary">Check back soon for trending tech stories.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {articles.map((article: { _id: string; slug: string; category: string; title: string; summary: string }, index: number) => (
                            <Link
                                key={article._id}
                                href={`/article/${article.slug}`}
                                className="group flex items-start gap-6 bg-card border border-default rounded-xl p-6 hover-lift transition-all duration-200 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                            >
                                <div className="shrink-0">
                                    <span className="text-5xl font-black text-muted group-hover:text-accent transition-colors">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Badge variant="accent" className="mb-2">{article.category}</Badge>

                                    <h2 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors mb-2">
                                        {article.title}
                                    </h2>

                                    <p className="text-secondary line-clamp-2">
                                        {article.summary}
                                    </p>
                                </div>

                                <ArrowUpRight className="shrink-0 text-muted group-hover:text-accent transition-colors" size={24} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
