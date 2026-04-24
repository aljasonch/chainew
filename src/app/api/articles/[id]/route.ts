import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/session/route";
import { deleteArticle, getArticleById } from "@/lib/firestore";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const article = await getArticleById(id);

        if (!article) {
            return NextResponse.json(
                { success: false, error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: article,
        });
    } catch (error) {
        console.error("Error fetching article:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch article" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Only admin and editor can delete
        if (!["admin", "editor"].includes(session.user.role)) {
            return NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            );
        }

        await deleteArticle(id);

        return NextResponse.json({
            success: true,
            message: "Article deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting article:", error);

        if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "not-found") {
            return NextResponse.json(
                { success: false, error: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to delete article" },
            { status: 500 }
        );
    }
}
