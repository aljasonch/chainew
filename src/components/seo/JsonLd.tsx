import { getBaseUrl } from "@/lib/utils";

interface ArticleData {
    title: string;
    slug: string;
    summary: string;
    seo: {
        metaDescription?: string;
        ogImageUrl?: string;
    };
    authorId?: {
        name?: string;
    };
    publishedAt?: Date | string;
    updatedAt?: Date | string;
}

interface JsonLdProps {
    article: ArticleData;
}

export function JsonLd({ article }: JsonLdProps) {
    const baseUrl = getBaseUrl() || "http://localhost:3000";
    const ogImageUrl = article.seo.ogImageUrl
        ? article.seo.ogImageUrl.startsWith("http://") || article.seo.ogImageUrl.startsWith("https://")
            ? article.seo.ogImageUrl
            : `${baseUrl}${article.seo.ogImageUrl}`
        : undefined;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.seo.metaDescription || article.summary,
        image: ogImageUrl ? [ogImageUrl] : undefined,
        datePublished: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : undefined,
        dateModified: article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : undefined,
        author: {
            "@type": "Person",
            name: article.authorId?.name || "Chainew",
        },
        publisher: {
            "@type": "Organization",
            name: "Chainew",
            logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${baseUrl}/article/${article.slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
