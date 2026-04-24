import { NextResponse } from "next/server";

import { auth } from "@/app/api/auth/session/route";
import {
    getCloudinary,
    getCloudinaryApiKey,
    getCloudinaryApiSecret,
    getCloudinaryCloudName,
    getCloudinaryUploadPreset,
} from "@/lib/cloudinary";

export async function POST() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cloudinary = getCloudinary();
    const timestamp = Math.floor(Date.now() / 1000);
    const uploadPreset = getCloudinaryUploadPreset();

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            upload_preset: uploadPreset,
        },
        getCloudinaryApiSecret()
    );

    return NextResponse.json({
        success: true,
        data: {
            timestamp,
            signature,
            uploadPreset,
            cloudName: getCloudinaryCloudName(),
            apiKey: getCloudinaryApiKey(),
        },
    });
}
