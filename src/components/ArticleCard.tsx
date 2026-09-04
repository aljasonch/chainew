import Link from "next/link";
import { SmartImage } from "@/components/SmartImage";
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
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <article className="border-t border-neutral-200 py-6 first:border-t-0 first:pt-0">
            <p className="kicker">
                <Link href={`/category/${article.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`} className="hover:text-black">
                    {article.category}
                </Link>
                {article.publishedAt && (
                    <span className="ml-2 font-medium normal-case tracking-normal text-neutral-400">
                        {formatDateShort(article.publishedAt)}
                    </span>
                )}
            </p>
            {article.seo?.ogImageUrl && (
                <Link
                    href={`/article/${article.slug}`}
                    className="mt-3 block h-44 overflow-hidden"
                    aria-label={article.title}
                >
                    <SmartImage
                        src={article.seo.ogImageUrl}
                        alt={article.title}
                    />
                </Link>
            )}
            <Link href={`/article/${article.slug}`} className="headline-link group mt-3 block">
                <h2 className="font-display text-xl font-bold leading-snug text-neutral-900">
                    {article.title}
                </h2>
            </Link>
            <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-3">
                {article.summary}
            </p>
            {article.authorId?.name && (
                <p className="mt-2 text-xs text-neutral-500">
                    By {article.authorId.name}
                </p>
            )}
        </article>
    );
}
