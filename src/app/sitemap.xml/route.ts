import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

function getBaseUrl(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    try {
        const url = new URL(request.url);
        return `${url.protocol}//${url.host}`;
    } catch {
        return "http://localhost:3000";
    }
}

export async function GET(request: NextRequest) {
    const baseUrl = getBaseUrl(request);

    try {
        await dbConnect();

        const articles = await Article.find({ status: "published" })
            .select("slug category updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        const categories = await Article.distinct("category", { status: "published" });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

        for (const category of categories) {
            xml += `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(category)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }

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
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        return new NextResponse(fallbackXml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=300, s-maxage=300",
                "X-Sitemap-Error": message,
            },
        });
    }
}
