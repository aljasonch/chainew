import { NextResponse } from "next/server";
import { fetchLatestNeuraFeedArticle } from "@/lib/neurafeed";
import { auth } from "@/app/api/auth/session/route";

export async function GET() {
    // Require an active admin session
    const session = await auth();
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const article = await fetchLatestNeuraFeedArticle();
    return NextResponse.json({ success: true, article: article ?? null });
}
