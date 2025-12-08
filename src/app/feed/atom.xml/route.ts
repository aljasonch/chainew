import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    await dbConnect();

    const articles = await Article.find({ status: "published" })
        .populate("authorId", "name")
        .select("title slug summary publishedAt updatedAt authorId")
        .sort({ publishedAt: -1 })
        .limit(50)
        .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>NewsPortal</title>
  <link href="${baseUrl}" rel="alternate"/>
  <link href="${baseUrl}/feed/atom.xml" rel="self"/>
  <id>${baseUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <subtitle>Latest news and updates from NewsPortal</subtitle>
`;

    for (const article of articles) {
        const authorName =
            article.authorId && typeof article.authorId === "object"
                ? (article.authorId as { name?: string }).name
                : "NewsPortal";

        xml += `  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${baseUrl}/article/${article.slug}"/>
    <id>${baseUrl}/article/${article.slug}</id>
    <updated>${new Date(article.updatedAt).toISOString()}</updated>
    <published>${new Date(article.publishedAt!).toISOString()}</published>
    <summary>${escapeXml(article.summary)}</summary>
    <author>
      <name>${escapeXml(authorName || "NewsPortal")}</name>
    </author>
  </entry>
`;
    }

    xml += `</feed>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/atom+xml",
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
