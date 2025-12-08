import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
    const robotsTxt = `# Robots.txt for Chainew

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml

# Googlebot
User-agent: Googlebot
Allow: /

# GPTBot (OpenAI)
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

# Google-Extended (Bard/Gemini training)
User-agent: Google-Extended
Allow: /

# Anthropic Claude
User-agent: anthropic-ai
Allow: /
Disallow: /admin/
Disallow: /api/

# Common Crawl
User-agent: CCBot
Allow: /

# Bing
User-agent: Bingbot
Allow: /
`;

    return new NextResponse(robotsTxt, {
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
    });
}
