const NEURAFEED_BASE = "https://feed.neuraspheres.com";

export interface NeuraFeedMedia {
    id: string;
    type: string;
    url: string;
    title?: string;
    caption?: string;
    sourceName?: string;
    sourceUrl?: string;
    afterSection: number;
}

export interface NeuraFeedSourceDetail {
    id: string;
    number: number;
    title: string;
    url: string;
    domain: string;
}

export interface NeuraFeedEmbed {
    type: string;
    id: string;
    title?: string;
    url?: string;
}

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
    media?: NeuraFeedMedia[];
    sourceDetails?: NeuraFeedSourceDetail[];
    embedMedia?: NeuraFeedEmbed | null;
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
    "Tech": [
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

    return "Tech";
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

/**
 * Resolves the article's Sources list. Prefers the structured
 * `sourceDetails` array (ordered by its `number`) and falls back to
 * parsing the legacy `sources` strings. Order matters: inline citation
 * markers link to #src-N by position.
 */
export function resolveNeuraFeedSources(
    article: Pick<NeuraFeedArticle, "sources" | "sourceDetails">
): { name: string; url: string }[] {
    const details = Array.isArray(article.sourceDetails) ? article.sourceDetails : [];
    const structured = details
        .filter(
            (d) =>
                d &&
                typeof d.url === "string" &&
                /^https?:\/\//.test(d.url) &&
                Number.isFinite(Number(d.number))
        )
        .sort((a, b) => Number(a.number) - Number(b.number))
        .map((d) => ({
            name: (typeof d.title === "string" && d.title.trim()) || d.domain || d.url,
            url: d.url,
        }));
    if (structured.length > 0) return structured;
    return parseNeuraFeedSources(article.sources ?? []);
}

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

/**
 * Validates an embedMedia payload. Only YouTube embeds with a well-formed
 * 11-char video id are accepted; anything else returns null so the
 * article page never renders an attacker-controlled iframe src.
 */
export function normalizeNeuraFeedEmbed(
    embed: NeuraFeedEmbed | null | undefined
): { type: "youtube"; id: string; title?: string } | null {
    if (!embed || typeof embed !== "object") return null;
    if (embed.type !== "youtube" || typeof embed.id !== "string") return null;
    if (!YOUTUBE_ID_RE.test(embed.id)) return null;
    return {
        type: "youtube",
        id: embed.id,
        ...(typeof embed.title === "string" && embed.title.trim()
            ? { title: embed.title.trim().slice(0, 200) }
            : {}),
    };
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
 * Converts NeuraFeed inline citation markers into clickable source links.
 * The feed emits markers like:
 *   <sup data-citation-id="citation-3" data-source-ids="source-1">[1]</sup>
 *   <sup data-citation-id="citation-2" data-source-ids="source-1,source-5">[1, 5]</sup>
 * These render as <sup class="citation"><a href="#src-1">[1]</a> ...</sup>,
 * matching the MDX <Citation> component (scrolls to the Sources list).
 * Plain <sup>[N]</sup> without data attributes is linked the same way.
 * Non-citation superscripts (e.g. x<sup>2</sup>) are left untouched.
 * Idempotent — already-linked markers are skipped.
 */
export function linkNeuraFeedCitations(html: string): string {
    return html.replace(/<sup\b([^>]*)>(.*?)<\/sup>/gi, (full, attrs: string, inner: string) => {
        if (/<a[\s>]/i.test(full) || /class="[^"]*\bcitation\b/i.test(attrs)) return full;

        const numbers: number[] = [];
        const sourceIds = attrs.match(/data-source-ids="([^"]*)"/i)?.[1] ?? "";
        for (const id of sourceIds.split(",")) {
            const n = Number((id.trim().match(/(\d+)\s*$/) ?? [])[1]);
            if (Number.isFinite(n) && n >= 1 && !numbers.includes(n)) numbers.push(n);
        }

        if (numbers.length === 0) {
            const text = inner.replace(/<[^>]*>/g, "").trim();
            const m = text.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/);
            if (!m) return full;
            for (const part of m[1].split(",")) {
                const n = Number(part.trim());
                if (Number.isFinite(n) && n >= 1 && !numbers.includes(n)) numbers.push(n);
            }
        }

        if (numbers.length === 0) return full;
        const links = numbers.map((n) => `<a href="#src-${n}">[${n}]</a>`).join(" ");
        return `<sup class="citation"${attrs ? ` ${attrs.trim()}` : ""}>${links}</sup>`;
    });
}

function escapeHtmlAttr(text: string): string {
    return escapeHtmlCell(text);
}

/**
 * Injects NeuraFeed media images as <figure> elements at their
 * afterSection positions. The feed keeps images out of the article HTML
 * and ships them separately with an afterSection index:
 *   section 0 = intro (before the first <h2>)
 *   section N = the Nth <h2> block and everything up to the next <h2>
 * A figure is appended at the end of its section. Out-of-range positions
 * are clamped to the end. Idempotent — already-injected figures
 * (data-media-id present) are skipped.
 */
export function injectNeuraFeedMedia(html: string, media?: NeuraFeedMedia[]): string {
    const items = (media ?? []).filter(
        (m) => m && m.type === "image" && typeof m.url === "string" && m.url.length > 0
    );
    if (items.length === 0) return html;

    const parts = html.split(/(?=<h2[\s>])/i);
    let result = html;
    let changed = false;

    const sorted = [...items].sort((a, b) => a.afterSection - b.afterSection);
    // Insert from the end so earlier indexes stay valid.
    for (let k = sorted.length - 1; k >= 0; k--) {
        const m = sorted[k];
        if (result.includes(`data-media-id="${m.id}"`)) continue;

        const caption = (m.caption ?? m.title ?? "").trim();
        const figcaption = caption
            ? `<figcaption>${escapeHtmlCell(caption)}${m.sourceUrl ? ` · Source: <a href="${escapeHtmlAttr(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtmlCell(m.sourceName ?? m.sourceUrl)}</a>` : ""}</figcaption>`
            : "";
        const figure =
            `<figure class="nf-media" data-media-id="${escapeHtmlAttr(m.id)}">` +
            `<img src="${escapeHtmlAttr(m.url)}" alt="${escapeHtmlAttr(caption || m.title || "Article image")}" loading="lazy">` +
            `${figcaption}</figure>`;

        const idx = Math.max(0, Math.min(m.afterSection, parts.length - 1));
        parts[idx] = parts[idx] + figure;
        changed = true;
    }

    if (changed) result = parts.join("");
    return result;
}

function escapeHtmlCell(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function splitPipeRow(line: string): string[] | null {
    // Bukan baris tabel kalau tidak mengandung pipe atau mengandung tag HTML.
    if (!line.includes("|") || line.includes("<") || line.includes(">")) return null;
    let cells = line.trim();
    if (cells.startsWith("|")) cells = cells.slice(1);
    if (cells.endsWith("|")) cells = cells.slice(0, -1);
    const parts = cells.split("|").map((c) => c.trim());
    if (parts.length < 2) return null;
    return parts;
}

function isDelimiterRow(line: string, columns: number): ("left" | "center" | "right" | null)[] | null {
    const cells = splitPipeRow(line);
    if (!cells || cells.length !== columns) return null;
    const aligns: ("left" | "center" | "right" | null)[] = [];
    for (const cell of cells) {
        const m = cell.match(/^(:?)-+(:?)$/);
        if (!m) return null;
        if (m[1] && m[2]) aligns.push("center");
        else if (m[2]) aligns.push("right");
        else if (m[1]) aligns.push("left");
        else aligns.push(null);
    }
    return aligns;
}

/**
 * Converts GFM pipe-tables pasted as plain text into <table> HTML.
 * NeuraFeed's LLM sometimes emits markdown tables inside the HTML string
 * instead of real <table> elements — without this they render as raw pipes.
 * Only consecutive pipe-lines (header + delimiter + body) are converted;
 * single pipe-lines (e.g. "A | B" prose) are left untouched. Idempotent:
 * lines already inside <table> markup contain < > and are skipped.
 */
export function convertPipeTablesToHtml(text: string): string {
    const lines = text.split("\n");
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const header = splitPipeRow(lines[i]);
        const aligns = header ? isDelimiterRow(lines[i + 1] ?? "", header.length) : null;

        if (!header || !aligns) {
            out.push(lines[i]);
            i += 1;
            continue;
        }

        const body: string[][] = [];
        let j = i + 2;
        while (j < lines.length) {
            const row = splitPipeRow(lines[j]);
            if (!row || row.length !== header.length) break;
            body.push(row);
            j += 1;
        }

        const alignAttr = (a: "left" | "center" | "right" | null) =>
            a ? ` align="${a}"` : "";
        let table = '<div class="nf-table-wrap"><table><thead><tr>';
        header.forEach((cell, idx) => {
            table += `<th${alignAttr(aligns[idx])}>${escapeHtmlCell(cell)}</th>`;
        });
        table += "</tr></thead><tbody>";
        for (const row of body) {
            table += "<tr>";
            row.forEach((cell, idx) => {
                table += `<td${alignAttr(aligns[idx])}>${escapeHtmlCell(cell)}</td>`;
            });
            table += "</tr>";
        }
        table += "</tbody></table></div>";
        out.push(table);
        i = j;
    }

    return out.join("\n");
}
/**
 * Converts residual markdown-style inline formatting to HTML.
 * NeuraFeed's LLM occasionally outputs **bold**, *italic*, or full
 * pipe-tables as plain text inside the HTML string instead of real
 * <strong>/<em>/<table> elements. Run this before storing or rendering.
 *
 * Idempotent — safe to run on already-sanitized content at render time,
 * so previously imported articles are fixed automatically.
 */
export function sanitizeNeuraFeedHtml(html: string): string {
    let sanitized = html;

    // Remove accidental LLM prompt template leakage (e.g. "Title: ... Summary: ... Article: ")
    // The LLM sometimes hallucinates its output format keys right into the start of the HTML.
    const leakRegex = /^[\s\S]{0,100}?(?:\*\*?)?Title:(?:\*\*?)?[\s\S]{1,500}?(?:\*\*?)?Summary:(?:\*\*?)?[\s\S]{1,2000}?(?:\*\*?)?Article:(?:\*\*?)?\s*(?:<\/[a-zA-Z0-9]+>\s*)?/i;
    sanitized = sanitized.replace(leakRegex, "");

    sanitized = convertPipeTablesToHtml(sanitized);

    sanitized = linkNeuraFeedCitations(sanitized);

    // Wrap bare <table> elements for horizontal scroll on small screens.
    // Skip when already wrapped (idempotent for render-time calls).
    if (!sanitized.includes("nf-table-wrap")) {
        sanitized = sanitized.replace(
            /<table([\s>])/gi,
            '<div class="nf-table-wrap"><table$1'
        );
        sanitized = sanitized.replace(/<\/table>/gi, "</table></div>");
    }

    // Drop empty paragraphs the feed occasionally emits around blocks.
    sanitized = sanitized.replace(/<p>(?:\s|&nbsp;)*<\/p>/gi, "");

    return sanitized
        // Double asterisk → bold (must run before single)
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
        // Single asterisk → italic
        .replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
}
