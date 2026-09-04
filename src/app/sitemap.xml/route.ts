import { NextResponse } from "next/server";
import { listPublishedForSitemap } from "@/lib/firestore";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    const articles = await listPublishedForSitemap();
    const categories = Array.from(
        new Set(articles.map((article) => article.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add category pages
    for (const category of categories) {
        xml += `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(category)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Add article pages
    for (const article of articles) {
        xml += `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
