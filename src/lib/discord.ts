import { truncate } from "@/lib/utils";

interface DiscordArticlePayload {
    title: string;
    slug: string;
    summary?: string;
    category?: string;
    tags?: string[];
    ogImageUrl?: string;
    publishedAt?: Date | string;
    authorName?: string;
    /** When true, renders a distinct NeuraFeed-branded embed */
    isNeuraFeed?: boolean;
    /** NeuraFeed topic label (e.g. "Google Gemini 2.5") */
    topic?: string;
}

const DISCORD_LIMITS = {
    title: 256,
    description: 4096,
    fieldValue: 1024,
    authorName: 256,
};

function clampForDiscord(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function resolveBaseUrl(): string {
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";
}

function toHttpUrl(value: string | undefined, baseUrl: string): string | undefined {
    if (!value) {
        return undefined;
    }

    try {
        const url = new URL(value, baseUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return undefined;
        }

        return url.toString();
    } catch {
        return undefined;
    }
}

export async function sendDiscordPublishNotification(
    payload: DiscordArticlePayload
): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL is not set; skipping Discord publish notification.");
        return;
    }

    const baseUrl = resolveBaseUrl();
    const articleUrl = toHttpUrl(`/article/${encodeURIComponent(payload.slug)}`, baseUrl);
    const publishedDate = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
    const timestamp = Number.isNaN(publishedDate.getTime())
        ? new Date().toISOString()
        : publishedDate.toISOString();
    const title = clampForDiscord(payload.title.trim(), DISCORD_LIMITS.title) || "New article published";
    const description = clampForDiscord(
        truncate(payload.summary ?? "", 350),
        DISCORD_LIMITS.description
    );
    const categoryValue = clampForDiscord(
        payload.category ?? "Uncategorized",
        DISCORD_LIMITS.fieldValue
    );
    const tagsValue = clampForDiscord(
        payload.tags && payload.tags.length ? payload.tags.slice(0, 5).join(", ") : "—",
        DISCORD_LIMITS.fieldValue
    );

    const embed: Record<string, unknown> = {
        title,
        description: description || "New article published.",
        // NeuraFeed = teal (#00b4d8) | manual = indigo (#5865f2)
        color: payload.isNeuraFeed ? 0x00b4d8 : 0x5865f2,
        fields: [
            {
                name: "Category",
                value: categoryValue,
                inline: true,
            },
            {
                name: "Tags",
                value: tagsValue,
                inline: true,
            },
            ...(payload.isNeuraFeed && payload.topic
                ? [{ name: "Topic", value: clampForDiscord(payload.topic, DISCORD_LIMITS.fieldValue), inline: false }]
                : []),
        ],
        timestamp,
        ...(payload.isNeuraFeed
            ? { footer: { text: "⚡ Powered by NeuraFeed · AI-generated & source-verified" } }
            : {}),
    };

    if (articleUrl) {
        embed.url = articleUrl;
    }

    const imageUrl = toHttpUrl(payload.ogImageUrl, baseUrl);
    if (imageUrl) {
        embed.image = { url: imageUrl };
    }

    if (payload.authorName) {
        embed.author = {
            name: clampForDiscord(payload.authorName, DISCORD_LIMITS.authorName),
        };
    }

    const body = {
        username: "Chainews",
        content: payload.isNeuraFeed ? "@everyone" : "@everyone",
        embeds: [embed],
        allowed_mentions: { parse: ["everyone"] },
    };

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to send Discord notification", errorText);
        }
    } catch (error) {
        console.error("Error sending Discord notification", error);
    }
}
