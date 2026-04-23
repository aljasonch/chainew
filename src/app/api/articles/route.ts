import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import { sendDiscordPublishNotification } from "@/lib/discord";
import Article from "@/models/Article";
import "@/models/User";
import Revision from "@/models/Revision";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const source = searchParams.get("source");

        const query: Record<string, unknown> = {};

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        if (source) {
            query.source = source;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { summary: { $regex: search, $options: "i" } },
            ];
        }

        const total = await Article.countDocuments(query);
        const articles = await Article.find(query)
            .populate("authorId", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                items: articles,
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

        await dbConnect();

        const body = await request.json();

        // Set author from session
        body.authorId = session.user.id;

        // Set publishedAt if status is published
        if (body.status === "published" && !body.publishedAt) {
            body.publishedAt = new Date();
        }

        const [article] = await Article.create([body]);

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
            { status: 500 }
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

        await dbConnect();

        const body = await request.json();
        const { id, ...updateData } = body;

        const existingArticle = await Article.findById(id);

        if (!existingArticle) {
            return NextResponse.json(
                { success: false, error: "Article not found" },
                { status: 404 }
            );
        }

        const wasPublished = existingArticle.status === "published";

        // Track changes for revision
        const changes: Record<string, { old: unknown; new: unknown }> = {};
        for (const key of Object.keys(updateData)) {
            if (
                JSON.stringify(existingArticle[key as keyof typeof existingArticle]) !==
                JSON.stringify(updateData[key])
            ) {
                changes[key] = {
                    old: existingArticle[key as keyof typeof existingArticle],
                    new: updateData[key],
                };
            }
        }

        // Set publishedAt if status changed to published
        if (
            updateData.status === "published" &&
            existingArticle.status !== "published"
        ) {
            updateData.publishedAt = new Date();
        }

        const article = await Article.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        // Auto publish to Discord if article just got published
        if (article && article.status === "published" && !wasPublished) {
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

        // Create revision if there are changes
        if (Object.keys(changes).length > 0) {
            await Revision.create({
                articleId: id,
                userId: session.user.id,
                changes,
            });
        }

        return NextResponse.json({
            success: true,
            data: article,
            message: "Article updated successfully",
        });
    } catch (error) {
        console.error("Error updating article:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update article" },
            { status: 500 }
        );
    }
}
