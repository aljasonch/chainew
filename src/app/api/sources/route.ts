import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Source from "@/models/Source";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search");

        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { url: { $regex: search, $options: "i" } },
            ];
        }

        const total = await Source.countDocuments(query);
        const sources = await Source.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                items: sources,
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

        await dbConnect();

        const body = await request.json();

        const source = await Source.create(body);

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

        await dbConnect();

        const body = await request.json();
        const { id, ...updateData } = body;

        const source = await Source.findByIdAndUpdate(id, updateData, {
            new: true,
        });

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

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Source ID is required" },
                { status: 400 }
            );
        }

        const source = await Source.findByIdAndDelete(id);

        if (!source) {
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
