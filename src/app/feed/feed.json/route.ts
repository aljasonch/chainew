import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    await dbConnect();

    const articles = await Article.find({ status: "published" })
        .populate("authorId", "name")
        .select("title slug summary publishedAt updatedAt authorId tags")
        .sort({ publishedAt: -1 })
        .limit(50)
        .lean();

    const feed = {
        version: "https://jsonfeed.org/version/1.1",
        title: "NewsPortal",
        home_page_url: baseUrl,
        feed_url: `${baseUrl}/feed/feed.json`,
        description: "Latest news and updates from NewsPortal",
        items: articles.map((article) => {
            const authorName =
                article.authorId && typeof article.authorId === "object"
                    ? (article.authorId as { name?: string }).name
                    : "NewsPortal";

            return {
                id: `${baseUrl}/article/${article.slug}`,
                url: `${baseUrl}/article/${article.slug}`,
                title: article.title,
                summary: article.summary,
                date_published: new Date(article.publishedAt!).toISOString(),
                date_modified: new Date(article.updatedAt).toISOString(),
                authors: [{ name: authorName }],
                tags: article.tags,
            };
        }),
    };

    return NextResponse.json(feed, {
        headers: {
            "Content-Type": "application/feed+json",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
