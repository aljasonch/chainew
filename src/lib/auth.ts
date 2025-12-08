import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
    return await auth();
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export function isAdmin(role?: string): boolean {
    return role === "admin";
}

export function isEditor(role?: string): boolean {
    return role === "admin" || role === "editor";
}

export function canManageArticles(role?: string): boolean {
    return role === "admin" || role === "editor" || role === "author";
}

export function canPublish(role?: string): boolean {
    return role === "admin" || role === "editor";
}

export function canManageUsers(role?: string): boolean {
    return role === "admin";
}
