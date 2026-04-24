import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: "Legacy image endpoint is retired. Use Cloudinary secure_url values.",
        },
        { status: 410 }
    );
}
