import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret });
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = request.nextUrl.pathname === "/login";

    if (isAdminRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage && token) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isAdminRoute && token) {
        const role = token.role as string;
        const path = request.nextUrl.pathname;

        if (path.startsWith("/admin/users") && role !== "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login"],
};
