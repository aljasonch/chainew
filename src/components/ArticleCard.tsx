import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { NeuraFeedBadge } from "@/components/ui/NeuraFeedBadge";
import { formatDateShort } from "@/lib/utils";

interface ArticleCardProps {
    article: {
        _id: string;
        title: string;
        slug: string;
        summary: string;
        category: string;
        source?: string;
        seo?: {
            ogImageUrl?: string;
        };
        publishedAt?: Date | string;
        authorId?: {
            name?: string;
        };
    };
    featured?: boolean;
    index?: number;
}

export function ArticleCard({ article, featured = false, index = 0 }: ArticleCardProps) {
    const staggerClass = index < 10 ? `stagger-${index + 1}` : "";

    return (
        <article
            className={`
        rounded-lg overflow-hidden 
        hover-lift transition-smooth
        animate-fadeInUp animate-on-load ${staggerClass}
        ${featured ? "md:flex" : ""}
        card
      `}
        >
            <div
                className={`overflow-hidden ${featured ? "md:w-1/2 h-48 md:h-auto" : "h-48"
                    } bg-muted`}
            >
                {article.seo?.ogImageUrl ? (
                    <img
                        src={article.seo.ogImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className={`p-4 ${featured ? "md:w-1/2 md:p-6" : ""}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="accent" className="transition-colors">
                        {article.category}
                    </Badge>
                    {article.source === "neurafeed" && <NeuraFeedBadge />}
                    {article.publishedAt && (
                        <span className="text-sm text-secondary">
                            {formatDateShort(article.publishedAt)}
                        </span>
                    )}
                </div>

                <Link href={`/article/${article.slug}`}>
                    <h2
                        className={`font-bold text-primary hover:text-accent transition-colors ${featured ? "text-xl md:text-2xl" : "text-lg"
                            }`}
                    >
                        {article.title}
                    </h2>
                </Link>

                <p
                    className={`mt-2 text-secondary ${featured ? "line-clamp-3" : "line-clamp-2"
                        }`}
                >
                    {article.summary}
                </p>

                {article.authorId?.name && (
                    <p className="mt-3 text-sm text-secondary">
                        By <span className="text-accent font-medium">{article.authorId.name}</span>
                    </p>
                )}
            </div>
        </article>
    );
}
