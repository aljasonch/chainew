import Link from "next/link";

const links = [
    { href: "/category/tech", label: "Tech" },
    { href: "/category/finance", label: "Finance" },
    { href: "/category/blockchain", label: "Blockchain" },
    { href: "/category/public-affairs", label: "Public Affairs" },
    { href: "/latest", label: "Latest" },
    { href: "/trending", label: "Trending" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Header() {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <header className="bg-white">
            <div className="border-b border-neutral-200">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs text-neutral-500">
                    <span className="hidden sm:block">{today}</span>
                    <span className="sm:hidden">
                        {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                    <Link href="/feed/rss.xml" className="hover:text-neutral-900 hover:underline underline-offset-4">
                        RSS Feed
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 pb-4 pt-6 text-center md:pb-5 md:pt-8">
                <Link href="/" className="inline-block">
                    <span className="font-display block text-4xl font-black tracking-tight text-neutral-900 md:text-5xl">
                        Chainew
                    </span>
                </Link>
                <p className="mt-2 text-xs tracking-wide text-neutral-500">
                    Technology, finance &amp; policy, reported plainly.
                </p>
            </div>

            <div className="sticky top-0 z-50 border-y border-neutral-900 bg-white">
                <nav
                    className="scrollbar-hide mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-3 lg:justify-center lg:gap-7"
                    aria-label="Sections"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700 hover:text-black hover:underline underline-offset-4"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
