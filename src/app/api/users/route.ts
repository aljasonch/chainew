import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/app/api/auth/session/route";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
} from "@/lib/firestore";
import { UserRole } from "@/types";

function isValidRole(role: unknown): role is UserRole {
    return role === "admin" || role === "editor" || role === "author";
}

function publicUser(user: {
    _id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function mapFirebaseError(error: unknown, fallback: string): { status: number; error: string } {
    if (error && typeof error === "object" && "code" in error) {
        const code = String((error as { code: string }).code);

        if (code === "auth/email-already-exists") {
            return { status: 400, error: "User already exists" };
        }

        if (code === "auth/user-not-found") {
            return { status: 404, error: "User not found" };
        }

        if (code === "auth/invalid-password") {
            return { status: 400, error: "Password must be at least 6 characters" };
        }

        if (code === "auth/invalid-email") {
            return { status: 400, error: "Invalid email" };
        }
    }

    return { status: 500, error: fallback };
}

async function findFirebaseUserUidByEmail(email: string): Promise<string | null> {
    try {
        const record = await adminAuth.getUserByEmail(email);
        return record.uid;
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "auth/user-not-found") {
            return null;
        }
        throw error;
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const { items, total } = await listUsers(page, limit);

        return NextResponse.json({
            success: true,
            data: {
                items: items.map(publicUser),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    let firebaseUid: string | null = null;

    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const role: UserRole = isValidRole(body.role) ? body.role : "author";

        if (!email || !name || !password) {
            return NextResponse.json(
                { success: false, error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        const firebaseUser = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });
        firebaseUid = firebaseUser.uid;

        await adminAuth.setCustomUserClaims(firebaseUid, { role });

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await createUser({
            email,
            name,
            passwordHash,
            role,
        });

        return NextResponse.json({
            success: true,
            data: publicUser(user),
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Error creating user:", error);

        if (firebaseUid) {
            await adminAuth.deleteUser(firebaseUid).catch(() => undefined);
        }

        if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "already-exists") {
            return NextResponse.json(
                { success: false, error: "User already exists" },
                { status: 400 }
            );
        }

        const mapped = mapFirebaseError(error, "Failed to create user");
        return NextResponse.json(
            { success: false, error: mapped.error },
            { status: mapped.status }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const id = typeof body.id === "string" ? body.id : "";

        if (!id) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const existing = await getUserById(id);
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const nextEmail =
            typeof body.email === "string" && body.email.trim()
                ? body.email.trim()
                : existing.email;
        const nextName =
            typeof body.name === "string" && body.name.trim()
                ? body.name.trim()
                : existing.name;
        const nextRole: UserRole = isValidRole(body.role) ? body.role : existing.role;
        const nextPassword =
            typeof body.password === "string" && body.password.length > 0
                ? body.password
                : undefined;

        let firebaseUid = await findFirebaseUserUidByEmail(existing.email);
        if (!firebaseUid && nextEmail !== existing.email) {
            firebaseUid = await findFirebaseUserUidByEmail(nextEmail);
        }

        if (!firebaseUid && !nextPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Firebase account not found. Set a new password to recreate the account.",
                },
                { status: 400 }
            );
        }

        if (firebaseUid) {
            const firebaseUpdates: {
                email?: string;
                password?: string;
                displayName?: string;
            } = {};

            if (nextEmail !== existing.email) {
                firebaseUpdates.email = nextEmail;
            }

            if (nextName !== existing.name) {
                firebaseUpdates.displayName = nextName;
            }

            if (nextPassword) {
                firebaseUpdates.password = nextPassword;
            }

            if (Object.keys(firebaseUpdates).length > 0) {
                await adminAuth.updateUser(firebaseUid, firebaseUpdates);
            }

            if (nextRole !== existing.role) {
                await adminAuth.setCustomUserClaims(firebaseUid, { role: nextRole });
            }
        } else {
            const created = await adminAuth.createUser({
                email: nextEmail,
                password: nextPassword,
                displayName: nextName,
            });
            await adminAuth.setCustomUserClaims(created.uid, { role: nextRole });
        }

        const firestoreUpdates: Partial<{
            email: string;
            passwordHash: string;
            name: string;
            role: UserRole;
        }> = {
            email: nextEmail,
            name: nextName,
            role: nextRole,
        };

        if (nextPassword) {
            firestoreUpdates.passwordHash = await bcrypt.hash(nextPassword, 12);
        }

        const user = await updateUser(id, firestoreUpdates);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: publicUser(user),
            message: "User updated successfully",
        });
    } catch (error) {
        console.error("Error updating user:", error);

        if (error && typeof error === "object" && "code" in error) {
            const code = (error as { code: string }).code;
            if (code === "not-found" || code === "auth/user-not-found") {
                return NextResponse.json(
                    { success: false, error: "User not found" },
                    { status: 404 }
                );
            }
            if (code === "already-exists" || code === "auth/email-already-exists") {
                return NextResponse.json(
                    { success: false, error: "User already exists" },
                    { status: 400 }
                );
            }
        }

        const mapped = mapFirebaseError(error, "Failed to update user");

        return NextResponse.json(
            { success: false, error: mapped.error },
            { status: mapped.status }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        if (id === session.user.id) {
            return NextResponse.json(
                { success: false, error: "Cannot delete yourself" },
                { status: 400 }
            );
        }

        const existing = await getUserById(id);
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        await deleteUser(id);

        const firebaseUid = await findFirebaseUserUidByEmail(existing.email);
        if (firebaseUid) {
            await adminAuth.deleteUser(firebaseUid);
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);

        if (error && typeof error === "object" && "code" in error) {
            const code = (error as { code: string }).code;
            if (code === "not-found" || code === "auth/user-not-found") {
                return NextResponse.json(
                    { success: false, error: "User not found" },
                    { status: 404 }
                );
            }
        }

        const mapped = mapFirebaseError(error, "Failed to delete user");
        return NextResponse.json(
            { success: false, error: mapped.error },
            { status: mapped.status }
        );
    }
}
