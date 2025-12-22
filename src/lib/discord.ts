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
}

export async function sendDiscordPublishNotification(
    payload: DiscordArticlePayload
): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL is not set; skipping Discord publish notification.");
        return;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const articleUrl = `${baseUrl}/article/${payload.slug}`;
    const description = truncate(payload.summary ?? "", 350);

    const embed: Record<string, unknown> = {
        title: payload.title,
        url: articleUrl,
        description: description || "New article published.",
        color: 0x5865f2,
        fields: [
            {
                name: "Category",
                value: payload.category ?? "Uncategorized",
                inline: true,
            },
            {
                name: "Tags",
                value: payload.tags && payload.tags.length
                    ? payload.tags.slice(0, 5).join(", ")
                    : "—",
                inline: true,
            },
        ],
        timestamp: (payload.publishedAt ? new Date(payload.publishedAt) : new Date()).toISOString(),
    };

    if (payload.ogImageUrl) {
        embed.image = { url: payload.ogImageUrl };
    }

    if (payload.authorName) {
        embed.author = { name: payload.authorName };
    }

    const body = {
        username: "Chainews",
        content: "@everyone",
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
