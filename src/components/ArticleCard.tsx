import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";

interface ArticleCardProps {
    article: {
        _id: string;
        title: string;
        slug: string;
        summary: string;
        category: string;
        seo?: {
            ogImageUrl?: string;
        };
        publishedAt?: Date | string;
        authorId?: {
            name?: string;
        };
    };
    featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
    return (
        <article
            className={`bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-400 transition-colors ${featured ? "md:flex" : ""
                }`}
        >
            {/* Image */}
            <div
                className={`bg-zinc-100 ${featured ? "md:w-1/2 h-48 md:h-auto" : "h-48"
                    }`}
            >
                {article.seo?.ogImageUrl ? (
                    <img
                        src={article.seo.ogImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`p-4 ${featured ? "md:w-1/2 md:p-6" : ""}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.publishedAt && (
                        <span className="text-sm text-zinc-500">
                            {formatDateShort(article.publishedAt)}
                        </span>
                    )}
                </div>

                <Link href={`/article/${article.slug}`}>
                    <h2
                        className={`font-bold text-zinc-900 hover:underline ${featured ? "text-xl md:text-2xl" : "text-lg"
                            }`}
                    >
                        {article.title}
                    </h2>
                </Link>

                <p
                    className={`mt-2 text-zinc-600 ${featured ? "line-clamp-3" : "line-clamp-2"
                        }`}
                >
                    {article.summary}
                </p>

                {article.authorId?.name && (
                    <p className="mt-3 text-sm text-zinc-500">
                        By {article.authorId.name}
                    </p>
                )}
            </div>
        </article>
    );
}
