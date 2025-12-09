import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import "@/models/User";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { ArrowLeft, Eye } from "lucide-react";
import { headers } from "next/headers";
import View from "@/models/View";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
    await dbConnect();

    const article = await Article.findOne({
        slug,
        status: "published",
    })
        .populate("authorId", "name email")
        .lean();

    return article;
}

async function trackArticleView(articleId: string): Promise<number | null> {
    try {
        // Ensure database connection
        await dbConnect();

        // Get IP address with fallback to x-real-ip header
        const headersList = await headers();
        let ip = headersList.get("x-forwarded-for");
        if (!ip) {
            ip = headersList.get("x-real-ip");
        }
        if (!ip) {
            // Skip tracking if IP is unknown to avoid all unknown users sharing the same view entry
            return null;
        }
        const finalIp = ip.split(",")[0].trim();

        // Create view record (will fail with duplicate key error if already exists)
        await View.create({ articleId, ip: finalIp });

        // Atomically increment the view count and return the updated document
        const updatedArticle = await Article.findByIdAndUpdate(
            articleId,
            { $inc: { views: 1 } },
            { new: true, select: 'views' }
        );
        
        return updatedArticle?.views ?? null;
    } catch (error: unknown) {
        // Duplicate key error (MongoDB error code 11000) is expected if the view already exists
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            // Expected: view already tracked for this articleId/ip, return current count
            const currentArticle = await Article.findById(articleId).select('views');
            return currentArticle?.views ?? null;
        }
        // Unexpected error: log for debugging
        console.error("Error tracking article view:", error);
        return null;
    }
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        return {
            title: "Article Not Found",
        };
    }

    const baseUrl = getBaseUrl();

    return {
        title: article.seo.metaTitle || article.title,
        description: article.seo.metaDescription || article.summary,
        openGraph: {
            title: article.seo.metaTitle || article.title,
            description: article.seo.metaDescription || article.summary,
            type: "article",
            url: `${baseUrl}/article/${article.slug}`,
            images: article.seo.ogImageUrl
                ? [{ url: article.seo.ogImageUrl }]
                : undefined,
            publishedTime: article.publishedAt?.toISOString(),
            authors: [
                article.authorId && typeof article.authorId === "object"
                    ? String((article.authorId as { name?: string }).name)
                    : "Unknown",
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: article.seo.metaTitle || article.title,
            description: article.seo.metaDescription || article.summary,
            images: article.seo.ogImageUrl ? [article.seo.ogImageUrl] : undefined,
        },
        alternates: {
            canonical: `${baseUrl}/article/${article.slug}`,
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticle(slug);

    // Check if article exists before proceeding
    if (!article) {
        notFound();
    }

    // Track view and get updated view count
    const updatedViewCount = await trackArticleView(article._id.toString());
    if (updatedViewCount !== null) {
        article.views = updatedViewCount;
    }

    const authorName =
        article.authorId && typeof article.authorId === "object"
            ? (article.authorId as { name?: string }).name
            : "Unknown";

    const renderContent = (mdx: string) => {
        const html = mdx
            .replace(
                /^### (.*$)/gim,
                '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
            )
            .replace(
                /^## (.*$)/gim,
                '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>'
            )
            .replace(
                /^# (.*$)/gim,
                '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>'
            )
            .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
            .replace(/\*(.*)\*/gim, "<em>$1</em>")
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/gim,
                '<a href="$2" class="text-blue-600 underline">$1</a>'
            )
            .replace(
                /!\[([^\]]*)\]\(([^)]+)\)/gim,
                '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />'
            )
            .replace(
                /```([\s\S]*?)```/gim,
                '<pre class="bg-zinc-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>'
            )
            .replace(/`([^`]+)`/gim, '<code class="bg-zinc-100 px-1 rounded">$1</code>')
            .replace(
                /^> (.*$)/gim,
                '<blockquote class="border-l-4 border-zinc-300 pl-4 italic my-4">$1</blockquote>'
            )
            .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/\n\n/gim, '</p><p class="my-4">')
            .replace(/\n/gim, "<br />");

        return `<p class="my-4">${html}</p>`;
    };

    return (
        <>
            <JsonLd article={JSON.parse(JSON.stringify(article))} />

            <article className="max-w-4xl mx-auto px-4 py-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                <header className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href={`/category/${article.category}`}>
                            <Badge variant="secondary">{article.category}</Badge>
                        </Link>
                        {article.publishedAt && (
                            <span className="text-zinc-500">
                                {formatDate(article.publishedAt)}
                            </span>
                        )}
                        <div className="flex items-center gap-1 text-zinc-500">
                            <Eye size={16} />
                            <span className="text-sm">{article.views || 0}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
                        {article.title}
                    </h1>

                    {article.subtitle && (
                        <p className="text-xl text-zinc-600 mb-4">{article.subtitle}</p>
                    )}

                    <p className="text-zinc-500">By {authorName}</p>
                </header>

                {article.seo.ogImageUrl && (
                    <div className="mb-8">
                        <img
                            src={article.seo.ogImageUrl}
                            alt={article.title}
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                )}

                <div className="bg-zinc-50 border-l-4 border-zinc-900 p-4 mb-8">
                    <p className="text-zinc-700 font-medium">{article.summary}</p>
                </div>

                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderContent(article.content_mdx) }}
                />

                {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-zinc-200">
                        <h3 className="text-sm font-medium text-zinc-500 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                                <Link key={tag} href={`/tag/${tag}`}>
                                    <Badge
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-zinc-300"
                                    >
                                        {tag}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {article.sources && article.sources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-zinc-200">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                            Sources
                        </h3>
                        <ul className="space-y-2">
                            {article.sources.map((source, index) => (
                                <li key={index}>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {source.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>
        </>
    );
}
