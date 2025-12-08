import { Sidebar } from "@/components/admin/Sidebar";
import { Providers } from "@/components/Providers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - Chainew CMS",
    description: "Manage your news website content",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
                <Sidebar />
                <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </main>
            </div>
        </Providers>
    );
}
