import { Sidebar } from "@/components/admin/Sidebar";
import { auth } from "@/app/api/auth/session/route";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Admin Dashboard - Chainew CMS",
    description: "Manage your news website content",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login?callbackUrl=/admin");
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <Sidebar user={session.user} />
            <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
