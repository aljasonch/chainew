import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Image from "@/models/Image";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        const image = await Image.findById(id);

        if (!image) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        return new NextResponse(image.data as Buffer as BodyInit, {
            headers: {
                "Content-Type": image.contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load image" },
            { status: 500 }
        );
    }
}
