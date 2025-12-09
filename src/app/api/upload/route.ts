import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Image from "@/models/Image";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type (allow any image)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        // Validate file size (150KB max)
        const MAX_SIZE = 150 * 1024; // 150KB
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size must be less than 150KB" },
                { status: 400 }
            );
        }

        await dbConnect();

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create image in MongoDB
        const image = await Image.create({
            data: buffer,
            contentType: file.type,
            filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255),
        });

        // Return API URL
        const url = `/api/images/${image._id}`;

        return NextResponse.json({
            success: true,
            url,
            message: "File uploaded successfully",
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to upload file" },
            { status: 500 }
        );
    }
}
