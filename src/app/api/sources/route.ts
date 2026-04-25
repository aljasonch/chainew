import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/session/route";
import {
    createSource,
    deleteSource,
    listSources,
    updateSource,
} from "@/lib/firestore";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search");

        const { items, total } = await listSources(page, limit, search);

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
        console.error("Error fetching sources:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch sources" },
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

        const source = await createSource({
            name: body.name,
            url: body.url,
        });

        return NextResponse.json({
            success: true,
            data: source,
            message: "Source created successfully",
        });
    } catch (error) {
        console.error("Error creating source:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create source" },
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

        const body = await request.json();
        const { id, ...updateData } = body;

        const source = await updateSource(id, updateData);

        if (!source) {
            return NextResponse.json(
                { success: false, error: "Source not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: source,
            message: "Source updated successfully",
        });
    } catch (error) {
        console.error("Error updating source:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update source" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Source ID is required" },
                { status: 400 }
            );
        }

        const deleted = await deleteSource(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Source not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Source deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting source:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete source" },
            { status: 500 }
        );
    }
}
