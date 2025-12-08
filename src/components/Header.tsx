"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/latest", label: "Latest" },
    { href: "/trending", label: "Trending" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="bg-card border-b border-default sticky top-0 z-50 animate-fadeInDown">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link
                        href="/"
                        className="text-xl font-bold text-primary hover:text-secondary transition-colors"
                    >
                        Chainew
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                    pathname === link.href
                                        ? "text-primary bg-muted"
                                        : "text-secondary hover:text-primary hover:bg-muted/50"
                                )}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-md hover:bg-muted transition-colors text-primary"
                        aria-label="Toggle menu"
                    >
                        <div className="relative w-6 h-6">
                            <Menu
                                size={24}
                                className={cn(
                                    "absolute inset-0 transition-all duration-200",
                                    mobileOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                                )}
                            />
                            <X
                                size={24}
                                className={cn(
                                    "absolute inset-0 transition-all duration-200",
                                    mobileOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                                )}
                            />
                        </div>
                    </button>
                </div>

                <div
                    className={cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
                        mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    )}
                >
                    <nav className="py-4 border-t border-default">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "block py-2 px-2 text-sm font-medium rounded-md transition-all duration-200",
                                    pathname === link.href
                                        ? "text-primary bg-muted"
                                        : "text-secondary hover:text-primary hover:bg-muted/50"
                                )}
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-10px)',
                                    opacity: mobileOpen ? 1 : 0,
                                    transition: `all 0.2s ease ${index * 0.05}s`
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
