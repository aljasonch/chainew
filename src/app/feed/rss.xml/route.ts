import { NextResponse } from "next/server";
import { listPublishedForFeeds } from "@/lib/firestore";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    const articles = await listPublishedForFeeds(50);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Chainew</title>
    <link>${baseUrl}</link>
    <description>Latest news and updates from Chainew</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed/rss.xml" rel="self" type="application/rss+xml"/>
`;

    for (const article of articles) {
        const authorName =
            article.authorId && typeof article.authorId === "object"
                ? (article.authorId as { name?: string }).name
                : "Chainew";

        xml += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/article/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/article/${article.slug}</guid>
      <description>${escapeXml(article.summary)}</description>
      <pubDate>${new Date(article.publishedAt!).toUTCString()}</pubDate>
      <author>${escapeXml(authorName || "Chainew")}</author>
    </item>
`;
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/rss+xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
