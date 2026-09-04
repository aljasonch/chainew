import { NextResponse } from "next/server";
import { listPublishedForNewsSitemap } from "@/lib/firestore";

export const revalidate = 600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    // Get articles published in the last 2 days (Google News requirement)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const articles = await listPublishedForNewsSitemap(twoDaysAgo);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

    for (const article of articles) {
        xml += `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Chainew</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.publishedAt!).toISOString()}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>
`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=1800, s-maxage=1800",
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
