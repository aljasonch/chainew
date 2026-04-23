/**
 * POST /api/neurafeed/sync
 *
 * Pulls the latest article from NeuraFeed, imports it into MongoDB if it's
 * new, and broadcasts to Discord. Called by Vercel Cron (00:30 UTC daily)
 * and also by the admin "Sync Now" button (via NextAuth session).
 *
 * Auth:
 *   - Vercel Cron: Authorization: Bearer <CRON_SECRET>
 *   - Admin manual: valid NextAuth session with role "admin"
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import User from "@/models/User";
import { sendDiscordPublishNotification } from "@/lib/discord";
import {
    fetchLatestNeuraFeedArticle,
    detectCategory,
    parseNeuraFeedSources,
    buildSlug,
    sanitizeNeuraFeedHtml,
} from "@/lib/neurafeed";

// ──────────────────────────────────────────────
// NeuraFeed "Bot" user — created once, reused on every import
// ──────────────────────────────────────────────

async function getOrCreateNeuraFeedUser(): Promise<string> {
    const existing = await User.findOne({ email: "neurafeed@chainew.bot" }).lean();
    if (existing) return String(existing._id);

    const created = await User.create({
        email: "neurafeed@chainew.bot",
        name: "NeuraFeed",
        passwordHash: "!", // unusable — this account never logs in
        role: "author",
    });

    return String(created._id);
}

// ──────────────────────────────────────────────
// Auth guard
// ──────────────────────────────────────────────

function isCronAuthorized(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return false;
    const authHeader = request.headers.get("authorization") ?? "";
    return authHeader === `Bearer ${cronSecret}`;
}

// ──────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // Accept either cron secret OR admin session
    const cronOk = isCronAuthorized(request);
    if (!cronOk) {
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
    }

    await dbConnect();

    // 1. Fetch latest article from NeuraFeed
    const nfArticle = await fetchLatestNeuraFeedArticle();
    if (!nfArticle) {
        return NextResponse.json({
            success: false,
            synced: false,
            reason: "no_article",
            message: "NeuraFeed returned no article.",
        });
    }

    // 2. Safety check: skip stale articles (older than 7 days)
    const articleAge =
        Date.now() - new Date(nfArticle.createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (articleAge > sevenDaysMs) {
        return NextResponse.json({
            success: false,
            synced: false,
            reason: "stale",
            message: "NeuraFeed article is older than 7 days — skipping.",
            topic: nfArticle.topic,
        });
    }

    // 3. Deduplication: compare the live article's ID against what we last imported.
    //    This avoids a full insert attempt when there is nothing new.
    const lastImported = await Article.findOne({ source: "neurafeed" })
        .sort({ publishedAt: -1 })
        .select("neuraFeedId")
        .lean() as { neuraFeedId?: string } | null;

    if (lastImported?.neuraFeedId && lastImported.neuraFeedId === nfArticle.id) {
        return NextResponse.json({
            success: true,
            synced: false,
            reason: "already_imported",
            message: "No new articles found. The latest NeuraFeed article is already published.",
            id: nfArticle.id,
            topic: nfArticle.topic,
        });
    }

    // 4. Secondary dedup: also check by neuraFeedId in case there are
    //    older articles with a matching ID that aren't the most recent.
    const existingById = await Article.findOne({ neuraFeedId: nfArticle.id }).lean();
    if (existingById) {
        return NextResponse.json({
            success: true,
            synced: false,
            reason: "already_imported",
            message: "This article already exists in the database.",
            id: nfArticle.id,
            topic: nfArticle.topic,
        });
    }

    // 4. Get (or create) the NeuraFeed system user
    const authorId = await getOrCreateNeuraFeedUser();

    // 5. Transform NeuraFeed → Chainew article shape
    const category = detectCategory(nfArticle.topic, nfArticle.title);
    const slug = buildSlug(nfArticle.title, nfArticle.createdAt);
    const sources = parseNeuraFeedSources(nfArticle.sources);
    // article field is HTML — sanitize markdown residue, then store in content_html
    const content_html = sanitizeNeuraFeedHtml(nfArticle.article);

    const articleData = {
        title: nfArticle.title,
        slug,
        subtitle: nfArticle.whyItMatters,
        summary: nfArticle.summary,
        category,
        tags: [
            nfArticle.topic.toLowerCase().replace(/\s+/g, "-"),
            "neurafeed",
            "ai-news",
        ],
        content_mdx: "",
        content_html,
        status: "published" as const,
        authorId,
        sources,
        seo: {
            metaTitle: nfArticle.title,
            metaDescription: nfArticle.summary.slice(0, 160),
        },
        publishedAt: new Date(nfArticle.createdAt),
        source: "neurafeed" as const,
        neuraFeedId: nfArticle.id,
    };

    // 6. Insert into MongoDB
    let article;
    try {
        [article] = await Article.create([articleData]);
    } catch (err: unknown) {
        // Handle duplicate key (race condition between two cron fires)
        if (
            err &&
            typeof err === "object" &&
            "code" in err &&
            (err as { code: number }).code === 11000
        ) {
            return NextResponse.json({
                success: true,
                synced: false,
                reason: "duplicate_key",
                topic: nfArticle.topic,
            });
        }
        console.error("[NeuraFeed sync] DB insert failed:", err);
        return NextResponse.json(
            { success: false, error: "Failed to save article" },
            { status: 500 }
        );
    }

    // 7. Discord broadcast
    await sendDiscordPublishNotification({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category,
        tags: article.tags,
        publishedAt: article.publishedAt,
        authorName: "NeuraFeed",
        isNeuraFeed: true,
        topic: nfArticle.topic,
    });

    console.log(
        `[NeuraFeed sync] Imported article "${article.title}" (topic: ${nfArticle.topic})`
    );

    return NextResponse.json(
        {
            success: true,
            synced: true,
            id: String(article._id),
            slug: article.slug,
            topic: nfArticle.topic,
            category,
        },
        { status: 201 }
    );
}

// Allow GET for Vercel Cron health-check (returns last imported article info)
export async function GET(request: NextRequest) {
    const cronOk = isCronAuthorized(request);
    if (!cronOk) {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
    }

    await dbConnect();
    const last = await Article.findOne({ source: "neurafeed" })
        .sort({ createdAt: -1 })
        .select("title slug topic createdAt neuraFeedId")
        .lean();

    return NextResponse.json({ success: true, lastImport: last ?? null });
}
