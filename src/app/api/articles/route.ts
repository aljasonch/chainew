import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/session/route";
import { sendDiscordPublishNotification } from "@/lib/discord";
import {
    createArticle,
    createRevision,
    listArticles,
    updateArticle,
} from "@/lib/firestore";

function asStatusCode(error: unknown): number {
    if (error && typeof error === "object" && "code" in error) {
        const code = String((error as { code: string }).code);
        if (code === "not-found") {
            return 404;
        }
        if (code === "already-exists") {
            return 400;
        }
    }
    return 500;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const source = searchParams.get("source");

        const { items, total } = await listArticles({
            page,
            limit,
            status,
            category,
            source,
            search,
            orderBy: "createdAt",
            orderDirection: "desc",
        });

        return NextResponse.json({
            success: true,
            data: {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching articles:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch articles" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const article = await createArticle({
            title: body.title,
            slug: body.slug,
            subtitle: body.subtitle,
            summary: body.summary,
            category: body.category,
            tags: body.tags,
            content_mdx: body.content_mdx,
            content_html: body.content_html,
            status: body.status,
            authorId: session.user.id,
            authorName: session.user.name,
            authorEmail: session.user.email ?? "",
            sources: body.sources,
            seo: body.seo,
            publishedAt: body.publishedAt,
            source: body.source,
            neuraFeedId: body.neuraFeedId,
        });

        // Auto publish to Discord if article is published
        if (article.status === "published") {
            await sendDiscordPublishNotification({
                title: article.title,
                slug: article.slug,
                summary: article.summary,
                category: article.category,
                tags: article.tags,
                ogImageUrl: article.seo?.ogImageUrl,
                publishedAt: article.publishedAt,
                authorName: session.user.name,
            });
        }

        return NextResponse.json({
            success: true,
            data: article,
            message: "Article created successfully",
        });
    } catch (error) {
        console.error("Error creating article:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create article" },
            { status: asStatusCode(error) }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { success: false, error: "Article ID is required" },
                { status: 400 }
            );
        }

        const { previous, current } = await updateArticle(id, {
            ...updateData,
            publishedAt:
                updateData.status === "published" && previousPublishedAtFallback(updateData)
                    ? new Date()
                    : updateData.publishedAt,
        });

        const wasPublished = previous.status === "published";

        const changes: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(updateData)) {
            const previousValue = (previous as unknown as Record<string, unknown>)[key];
            const currentValue = (current as unknown as Record<string, unknown>)[key];
            if (JSON.stringify(previousValue) !== JSON.stringify(currentValue)) {
                changes[key] = { old: previousValue, new: currentValue };
            }
        }

        // Auto publish to Discord if article just got published
        if (current.status === "published" && !wasPublished) {
            await sendDiscordPublishNotification({
                title: current.title,
                slug: current.slug,
                summary: current.summary,
                category: current.category,
                tags: current.tags,
                ogImageUrl: current.seo?.ogImageUrl,
                publishedAt: current.publishedAt,
                authorName: session.user.name,
            });
        }

        // Create revision if there are changes
        if (Object.keys(changes).length > 0) {
            await createRevision({
                articleId: id,
                userId: session.user.id,
                changes,
            });
        }

        return NextResponse.json({
            success: true,
            data: current,
            message: "Article updated successfully",
        });
    } catch (error) {
        console.error("Error updating article:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update article" },
            { status: asStatusCode(error) }
        );
    }
}

function previousPublishedAtFallback(updateData: Record<string, unknown>): boolean {
    return updateData.status === "published" && !updateData.publishedAt;
}
