import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { after } from "next/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { headers } from "next/headers";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { preprocessCitations } from "@/lib/remark-citations";
import { mdxComponents } from "@/components/markdown/components";
import { sanitizeNeuraFeedHtml, injectNeuraFeedMedia } from "@/lib/neurafeed";
import { normalizeMarkdownListMarkers } from "@/lib/markdown";
import { getArticleBySlug, trackArticleView as trackFirestoreArticleView } from "@/lib/firestore";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
    return getArticleBySlug(slug, "published");
}

// generateMetadata + page component run in the same request —
// dedupe so the article document is read once, not twice.
const getCachedArticle = cache(getArticle);

async function trackArticleViewByRequest(articleId: string, ip: string): Promise<number | null> {
    try {
        return await trackFirestoreArticleView(articleId, ip);
    } catch (error: unknown) {
        console.error("Error tracking article view:", error);
        return null;
    }
}

// Crawlers must not count as readers (or burn writes).
const BOT_UA_RE =
    /bot|crawl|spider|slurp|mediapartners|baidu|yandex|sogou|exabot|facebot|ia_archiver|ahrefs|semrush|mj12|dotbot|applebot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|slackbot|discordbot|telegrambot|whatsapp|googlebot|bingbot|duckduckbot/i;

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getCachedArticle(slug);

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
    const article = await getCachedArticle(slug);

    if (!article) {
        notFound();
    }

    // View tracking must never delay the render, so it runs in after()
    // with headers read up front (request scope is gone by then).
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? "";
    const rawIp =
        headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "";
    const ip = rawIp.split(",")[0].trim();
    if (ip && !BOT_UA_RE.test(userAgent)) {
        const articleId = article._id;
        after(() => {
            trackArticleViewByRequest(articleId, ip).catch((error: unknown) => {
                console.error("Error tracking article view:", error);
            });
        });
    }

    const authorName =
        article.authorId && typeof article.authorId === "object"
            ? (article.authorId as { name?: string }).name
            : "Unknown";

    const isNeuraFeed = (article as unknown as { source?: string }).source === "neurafeed";

    let content: React.ReactNode = null;
    if (!isNeuraFeed && article.content_mdx) {
        const compiled = await compileMDX({
            source: preprocessCitations(normalizeMarkdownListMarkers(article.content_mdx || "")),
            options: {
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                },
            },
            components: mdxComponents,
        });
        content = compiled.content;
    }

    return (
        <>
            <JsonLd article={JSON.parse(JSON.stringify(article))} />

            <article className="bg-white">
                <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
                    <Link
                        href="/"
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-black hover:underline underline-offset-4"
                    >
                        ← Home
                    </Link>

                    <header className="mt-6">
                        <p className="kicker">
                            <Link href={`/category/${article.category}`} className="hover:text-black">
                                {article.category}
                            </Link>
                        </p>

                        <h1 className="font-display mt-3 text-3xl font-black leading-[1.12] text-neutral-900 md:text-[2.75rem]">
                            {article.title}
                        </h1>

                        {article.subtitle && (
                            <p className="font-display mt-4 text-lg leading-relaxed text-neutral-600 md:text-xl">
                                {article.subtitle}
                            </p>
                        )}

                        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-neutral-200 py-3 text-sm text-neutral-600">
                            <span>
                                By <span className="font-semibold text-neutral-900">{authorName}</span>
                            </span>
                            {article.publishedAt && (
                                <span className="text-neutral-500">
                                    {formatDate(article.publishedAt)}
                                </span>
                            )}
                            <span className="text-neutral-400">
                                {article.views || 0} reads
                            </span>
                        </div>
                    </header>

                    {article.seo.ogImageUrl && (
                        <figure className="mt-8">
                            <img
                                src={article.seo.ogImageUrl}
                                alt={article.title}
                                className="w-full h-auto bg-neutral-100"
                            />
                            {article.coverCredit && (article.coverCredit.name || article.coverCredit.url) && (
                                <figcaption className="border-b border-neutral-200 py-2 text-xs text-neutral-500">
                                    Image{article.coverCredit.url ? (
                                        <>
                                            {" "}source:{" "}
                                            <a
                                                href={article.coverCredit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline underline-offset-4 hover:text-neutral-900"
                                            >
                                                {article.coverCredit.name || article.coverCredit.url}
                                            </a>
                                        </>
                                    ) : (
                                        <>: {article.coverCredit.name}</>
                                    )}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {article.embedMedia?.type === "youtube" && /^[\w-]{11}$/.test(article.embedMedia.id) && (
                        <figure className="nf-embed mt-8">
                            <div className="nf-embed-frame">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${article.embedMedia.id}`}
                                    title={article.embedMedia.title || "Embedded video"}
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {article.embedMedia.title && (
                                <figcaption className="border-b border-neutral-200 py-2 text-xs text-neutral-500">
                                    Watch: {article.embedMedia.title}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    <p className="font-display mt-8 border-b border-neutral-200 pb-8 text-lg leading-8 text-neutral-800">
                        {article.summary}
                    </p>

                    {isNeuraFeed ? (
                        <div
                            className="article-body mt-8"
                            dangerouslySetInnerHTML={{
                                __html: injectNeuraFeedMedia(
                                    sanitizeNeuraFeedHtml(article.content_html || ""),
                                    article.media
                                )
                            }}
                        />
                    ) : (
                        <div className="article-body mt-8">{content}</div>
                    )}

                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-10 border-t border-neutral-200 pt-6">
                            <p className="kicker">Filed under</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                {article.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/tag/${tag}`}
                                        className="text-sm text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-black"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {article.sources && article.sources.length > 0 && (
                        <div className="mt-10 border-t border-neutral-200 pt-6">
                            <p className="kicker">Sources</p>
                            <ol className="mt-4 space-y-2">
                                {article.sources.map((source, index) => (
                                    <li key={index} id={`src-${index + 1}`} className="flex items-start gap-2 text-sm scroll-mt-24">
                                        <span className="shrink-0 font-mono text-xs text-neutral-400">
                                            [{index + 1}]
                                        </span>
                                        {source.url ? (
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="break-all text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-black"
                                            >
                                                {source.name}
                                            </a>
                                        ) : (
                                            <span className="text-neutral-600">{source.name}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </article>
        </>
    );
}
