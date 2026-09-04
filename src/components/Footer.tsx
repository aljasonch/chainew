import Link from "next/link";

const sections = [
    { href: "/category/tech", label: "Tech" },
    { href: "/category/finance", label: "Finance" },
    { href: "/category/blockchain", label: "Blockchain" },
    { href: "/category/public-affairs", label: "Public Affairs" },
    { href: "/latest", label: "Latest" },
    { href: "/trending", label: "Trending" },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-neutral-900 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <Link href="/" className="font-display text-2xl font-black text-neutral-900">
                            Chainew
                        </Link>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-600">
                            Clear coverage of technology, markets, and policy.
                            Short stories, named sources, no noise.
                        </p>
                    </div>

                    <nav aria-label="Sections">
                        <p className="kicker">Sections</p>
                        <ul className="mt-4 space-y-2.5">
                            {sections.map((s) => (
                                <li key={s.href}>
                                    <Link href={s.href} className="text-sm text-neutral-700 hover:text-black hover:underline underline-offset-4">
                                        {s.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Newsroom">
                        <p className="kicker">Newsroom</p>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <Link href="/about" className="text-sm text-neutral-700 hover:text-black hover:underline underline-offset-4">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-neutral-700 hover:text-black hover:underline underline-offset-4">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/feed/rss.xml" className="text-sm text-neutral-700 hover:text-black hover:underline underline-offset-4">
                                    RSS Feed
                                </Link>
                            </li>
                            <li>
                                <Link href="/sitemap.xml" className="text-sm text-neutral-700 hover:text-black hover:underline underline-offset-4">
                                    Sitemap
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>&copy; {year} Chainew. All rights reserved.</span>
                    <Link href="/login" className="hover:text-neutral-900 hover:underline underline-offset-4">
                        Staff sign in
                    </Link>
                </div>
            </div>
        </footer>
    );
}
