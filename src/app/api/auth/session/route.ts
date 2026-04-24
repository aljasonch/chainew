import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";

import { getUserByEmail } from "@/lib/firestore";
import { adminAuth } from "@/lib/firebaseAdmin";
import { AuthSession } from "@/types";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

function getCookieSecureFlag(request: NextRequest): boolean {
    if (process.env.NODE_ENV === "production") {
        return true;
    }

    return request.nextUrl.protocol === "https:";
}

function mapFirebaseAuthError(error: unknown): { status: number; message: string } {
    if (error && typeof error === "object" && "code" in error) {
        const code = String((error as { code: string }).code);

        if (
            code === "auth/invalid-id-token" ||
            code === "auth/id-token-expired" ||
            code === "auth/invalid-credential" ||
            code === "auth/argument-error"
        ) {
            return {
                status: 401,
                message: `Firebase auth token rejected (${code})`,
            };
        }

        if (code === "auth/insufficient-permission" || code === "auth/app-not-authorized") {
            return {
                status: 500,
                message: `Firebase Admin is not authorized to create the session cookie (${code})`,
            };
        }
    }

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Could not load the default credentials")) {
        return {
            status: 500,
            message: "Firebase Admin credentials are missing or invalid",
        };
    }

    return {
        status: 500,
        message: message || "Firebase session creation failed",
    };
}

async function resolveSessionFromDecodedToken(decoded: DecodedIdToken): Promise<AuthSession | null> {
    if (!decoded.email) {
        return null;
    }

    const appUser = await getUserByEmail(decoded.email);
    if (!appUser) {
        return null;
    }

    return {
        user: {
            id: appUser._id,
            uid: decoded.uid,
            email: appUser.email,
            name: appUser.name,
            role: appUser.role,
        },
    };
}

async function resolveSessionFromCookieValue(cookieValue: string): Promise<AuthSession | null> {
    try {
        const decoded = await adminAuth.verifySessionCookie(cookieValue, true);
        return await resolveSessionFromDecodedToken(decoded);
    } catch {
        return null;
    }
}

export async function auth(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!cookieValue) {
        return null;
    }

    return resolveSessionFromCookieValue(cookieValue);
}

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    return NextResponse.json({ success: true, data: session });
}

export async function POST(request: NextRequest) {
    let idToken = "";

    try {
        const body = await request.json();
        if (body && typeof body.idToken === "string") {
            idToken = body.idToken;
        }
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }

    if (!idToken) {
        return NextResponse.json(
            { success: false, error: "Missing Firebase ID token" },
            { status: 400 }
        );
    }

    try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const session = await resolveSessionFromDecodedToken(decoded);

        if (!session) {
            return NextResponse.json(
                { success: false, error: "User account is not provisioned for CMS access" },
                { status: 403 }
            );
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: SESSION_MAX_AGE_MS,
        });

        const response = NextResponse.json({
            success: true,
            data: session,
            message: "Signed in",
        });

        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: sessionCookie,
            maxAge: SESSION_MAX_AGE_MS / 1000,
            httpOnly: true,
            secure: getCookieSecureFlag(request),
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (error) {
        const mapped = mapFirebaseAuthError(error);
        console.error("Firebase session sign-in failed:", error);

        return NextResponse.json(
            { success: false, error: mapped.message },
            { status: mapped.status }
        );
    }
}