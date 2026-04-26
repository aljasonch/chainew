const NEURAFEED_BASE = "https://feed.neuraspheres.com";

export interface NeuraFeedArticle {
    id: string;
    title: string;
    summary: string;
    article: string;
    whyItMatters: string;
    sources: string[];
    tags: string[];
    topic: string;
    createdAt: string; // ISO 8601
    coverImage?: string;
    imageSource?: string;
    imageSourceUrl?: string;
}

export interface NeuraFeedLatestResponse {
    article: NeuraFeedArticle | null;
}

export async function fetchLatestNeuraFeedArticle(): Promise<NeuraFeedArticle | null> {
    try {
        const res = await fetch(`${NEURAFEED_BASE}/api/latest-news`, {
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            console.error(`[NeuraFeed] /api/latest-news returned ${res.status}`);
            return null;
        }

        const data: NeuraFeedLatestResponse = await res.json();
        return data.article ?? null;
    } catch (err) {
        console.error("[NeuraFeed] Failed to fetch latest article:", err);
        return null;
    }
}

// ──────────────────────────────────────────────
// Category auto-detection
// ──────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "AI & ML": [
        "ai", "artificial intelligence", "machine learning", "ml", "llm",
        "gpt", "claude", "gemini", "openai", "anthropic", "deepmind",
        "neural", "model", "chatbot", "generative", "transformer",
        "diffusion", "midjourney", "stable diffusion", "copilot",
        "mistral", "llama", "groq", "hugging face", "robotics",
    ],
    "Blockchain": [
        "bitcoin", "btc", "ethereum", "eth", "crypto", "blockchain",
        "defi", "nft", "web3", "solana", "polygon", "layer 2",
        "stablecoin", "dao", "token", "wallet", "coinbase", "binance",
    ],
    "Finance": [
        "stock", "market", "fed", "federal reserve", "inflation",
        "economy", "gdp", "interest rate", "bank", "recession",
        "ipo", "nasdaq", "s&p", "dow jones", "treasury", "hedge fund",
        "investment", "venture capital", "vc", "startup funding",
    ],
    "Public Affairs": [
        "government", "policy", "election", "congress", "senate",
        "law", "regulation", "supreme court", "white house", "president",
        "eu", "parliament", "legislation", "antitrust", "tariff", "gdpr",
    ],
};

export function detectCategory(topic: string, title: string): string {
    const haystack = `${topic} ${title}`.toLowerCase();
    const scores: Record<string, number> = {};
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        scores[cat] = keywords.filter((kw) => haystack.includes(kw)).length;
    }

    const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    if (best && best[1] > 0) return best[0];

    return "AI & ML";
}

export function parseNeuraFeedSources(
    sources: string[]
): { name: string; url: string }[] {
    const numberedRe = /^\[\d+\]\s+(.+?):\s*(https?:\/\/\S+)/;
    const plainRe = /^(.+?):\s*(https?:\/\/\S+)/;

    return sources
        .map((s) => {
            const m = s.match(numberedRe) ?? s.match(plainRe);
            if (!m) return null;
            const name = m[1].trim();
            const url = m[2].trim();
            if (!name || !url) return null;
            return { name, url };
        })
        .filter(Boolean) as { name: string; url: string }[];
}

export function buildSlug(title: string, createdAt: string): string {
    const dateSuffix = new Date(createdAt)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60)
        .replace(/-+$/, "");

    return `${base}-${dateSuffix}`;
}

// ──────────────────────────────────────────────
// HTML sanitizer
// ──────────────────────────────────────────────

/**
 * Converts residual markdown-style inline formatting to HTML.
 * NeuraFeed's LLM occasionally outputs **bold** or *italic* inside <p> tags
 * instead of <strong>/<em>. Run this before storing or rendering content.
 *
 *   **text** → <strong>text</strong>
 *   *text*   → <em>text</em>
 */
export function sanitizeNeuraFeedHtml(html: string): string {
    let sanitized = html;

    // Remove accidental LLM prompt template leakage (e.g. "Title: ... Summary: ... Article: ")
    // The LLM sometimes hallucinates its output format keys right into the start of the HTML.
    const leakRegex = /^[\s\S]{0,100}?(?:\*\*?)?Title:(?:\*\*?)?[\s\S]{1,500}?(?:\*\*?)?Summary:(?:\*\*?)?[\s\S]{1,2000}?(?:\*\*?)?Article:(?:\*\*?)?\s*(?:<\/[a-zA-Z0-9]+>\s*)?/i;
    sanitized = sanitized.replace(leakRegex, "");

    return sanitized
        // Double asterisk → bold (must run before single)
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
        // Single asterisk → italic
        .replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
}
