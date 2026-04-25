"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

function mapFirebaseError(error: unknown): string {
    if (error && typeof error === "object" && "code" in error) {
        const code = String((error as { code: string }).code);
        if (
            code === "auth/invalid-credential" ||
            code === "auth/user-not-found" ||
            code === "auth/wrong-password" ||
            code === "auth/invalid-email"
        ) {
            return "Invalid email or password";
        }

        if (code === "auth/too-many-requests") {
            return "Too many login attempts. Please try again later.";
        }
    }

    return "An error occurred. Please try again.";
}

function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/admin";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const firebaseAuth = getAuth(firebaseApp);
            const credential = await signInWithEmailAndPassword(
                firebaseAuth,
                email.trim(),
                password
            );
            const idToken = await credential.user.getIdToken(true);

            const sessionRes = await fetch("/api/auth/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });
            const sessionPayload = await sessionRes.json();

            if (!sessionRes.ok || !sessionPayload?.success) {
                await signOut(firebaseAuth).catch(() => undefined);
                setError(
                    typeof sessionPayload?.error === "string"
                        ? sessionPayload.error
                        : "Failed to create session"
                );
                setLoading(false);
            } else {
                window.location.href = callbackUrl;
            }
        } catch (error) {
            setError(mapFirebaseError(error));
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Chainew</h1>
                <p className="text-secondary mt-2">News CMS</p>
            </div>

            <Card className="border-default shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl text-primary">Welcome Back</CardTitle>
                    <p className="text-secondary mt-1 text-sm">
                        Sign in to access the admin dashboard
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 border rounded-md text-sm animate-fadeIn" style={{ background: 'var(--color-error-light)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="text-center text-sm text-secondary mt-6">
                Back to{" "}
                <Link href="/" className="text-primary hover:text-accent font-medium transition-colors">
                    Chainew
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-muted)' }}>
            <Suspense fallback={
                <div className="w-full max-w-md text-center">
                    <div className="text-3xl font-bold text-primary mb-4">Chainew</div>
                    <p className="text-secondary">Loading...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
