import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = request.nextUrl.pathname === "/login";

    // Redirect to login if accessing admin without auth
    if (isAdminRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to admin if already logged in and accessing login page
    if (isLoginPage && token) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Check role-based access for admin routes
    if (isAdminRoute && token) {
        const role = token.role as string;
        const path = request.nextUrl.pathname;

        // Users management is admin only
        if (path.startsWith("/admin/users") && role !== "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login"],
};
