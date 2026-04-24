"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    Users,
    Link2,
    ClipboardCheck,
    History,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/sources", label: "Sources", icon: Link2 },
    { href: "/admin/review", label: "Review Queue", icon: ClipboardCheck },
    { href: "/admin/revisions", label: "Revisions", icon: History },
    { href: "/admin/neurafeed", label: "NeuraFeed", icon: Radio, adminOnly: true },
    { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    const filteredNavItems = navItems.filter(
        (item) => !item.adminOnly || session?.user.role === "admin"
    );

    return (
        <>
            <div
                className="lg:hidden fixed top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-40 bg-card border-b border-default"
            >
                <Link href="/admin" className="font-bold text-primary">
                    Chainew Admin
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-md hover:bg-muted transition-colors text-primary"
                >
                    <div className="relative w-6 h-6">
                        <Menu
                            size={24}
                            className={cn(
                                "absolute inset-0 transition-all duration-200",
                                mobileOpen ? "opacity-0 rotate-90" : "opacity-100"
                            )}
                        />
                        <X
                            size={24}
                            className={cn(
                                "absolute inset-0 transition-all duration-200",
                                mobileOpen ? "opacity-100" : "opacity-0 -rotate-90"
                            )}
                        />
                    </div>
                </button>
            </div>

            <aside
                className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 w-64 bg-card border-r border-default"
            >
                <div className="p-6">
                    <Link
                        href="/admin"
                        className="text-xl font-bold text-primary hover:text-accent transition-colors"
                    >
                        Chainew
                    </Link>
                    <span className="ml-2 text-xs font-medium text-accent uppercase tracking-wider">
                        Admin
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item, index) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                                    isActive ? "bg-primary text-inverse" : "text-primary"
                                )}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--color-muted)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <item.icon size={18} />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight
                                    size={14}
                                    className={cn(
                                        "transition-transform duration-200",
                                        isActive
                                            ? "opacity-100 translate-x-0"
                                            : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                                    )}
                                />
                            </Link>
                        );
                    })}
                </nav>

                <div
                    className="p-4 border-t border-default"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-accent text-inverse"
                        >
                            {session?.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary truncate">
                                {session?.user.name}
                            </p>
                            <p className="text-xs text-accent capitalize">
                                {session?.user.role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-primary hover:bg-error-light hover:text-error"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            <div
                className={cn(
                    "lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                    mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileOpen(false)}
            />

            <aside
                className={cn(
                    "lg:hidden fixed top-0 left-0 bottom-0 w-64 z-50 flex flex-col transform transition-transform duration-300 ease-out bg-card",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b border-default">
                    <Link href="/admin" className="text-xl font-bold text-primary">
                        Chainew Admin
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item, index) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                    isActive ? "bg-primary text-inverse" : "text-primary"
                                )}
                                style={{
                                    transform: mobileOpen ? "translateX(0)" : "translateX(-10px)",
                                    opacity: mobileOpen ? 1 : 0,
                                    transition: `all 0.2s ease ${index * 0.05}s`,
                                }}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-default">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-primary hover:bg-muted"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}
