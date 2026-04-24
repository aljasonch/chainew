import "server-only";

import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function getCloudinaryEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required Cloudinary environment variable: ${name}`);
    }
    return value;
}

export function getCloudinaryCloudName(): string {
    return getCloudinaryEnv("CLOUDINARY_CLOUD_NAME");
}

export function getCloudinaryApiKey(): string {
    return getCloudinaryEnv("CLOUDINARY_API_KEY");
}

export function getCloudinaryApiSecret(): string {
    return getCloudinaryEnv("CLOUDINARY_API_SECRET");
}

export function getCloudinaryUploadPreset(): string {
    return getCloudinaryEnv("CLOUDINARY_UPLOAD_PRESET");
}

export function getCloudinary() {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: getCloudinaryCloudName(),
            api_key: getCloudinaryApiKey(),
            api_secret: getCloudinaryApiSecret(),
            secure: true,
        });
        isConfigured = true;
    }

    return cloudinary;
}
