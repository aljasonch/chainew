import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/session/route";
import { sendDiscordPublishNotification } from "@/lib/discord";
import { getArticleById } from "@/lib/firestore";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const article = await getArticleById(id);

        if (!article) {
            return NextResponse.json(
                { success: false, error: "Article not found" },
                { status: 404 }
            );
        }

        if (article.status !== "published") {
            return NextResponse.json(
                { success: false, error: "Article must be published before sharing to Discord" },
                { status: 400 }
            );
        }

        const authorName =
            article.authorId && typeof article.authorId === "object"
                ? (article.authorId as { name?: string }).name
                : session.user.name;

        await sendDiscordPublishNotification({
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            category: article.category,
            tags: article.tags,
            ogImageUrl: article.seo?.ogImageUrl,
            publishedAt: article.publishedAt,
            authorName: authorName ?? session.user.name,
        });

        return NextResponse.json({
            success: true,
            message: "Article shared to Discord successfully",
        });
    } catch (error) {
        console.error("Error sharing to Discord:", error);
        return NextResponse.json(
            { success: false, error: "Failed to share to Discord" },
            { status: 500 }
        );
    }
}
