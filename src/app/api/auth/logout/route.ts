import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "__session";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Signed out" });

    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}