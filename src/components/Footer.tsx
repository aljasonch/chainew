import Link from "next/link";

const categories = [
    "AI & ML",
    "Finance",
    "Blockchain",
    "Public Affairs",
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white">
                            Chainew
                        </Link>
                        <p className="mt-4 text-sm max-w-md" style={{ color: 'var(--color-muted)' }}>
                            Your trusted source for the latest tech news and updates. Stay
                            informed with comprehensive coverage of AI, software development,
                            cybersecurity, and emerging technologies.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-accent)' }}>Categories</h3>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/category/${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                                        className="text-sm hover:text-white transition-colors"
                                        style={{ color: 'var(--color-muted)' }}
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-accent)' }}>Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/feed/rss.xml"
                                    className="text-sm hover:text-white transition-colors"
                                    style={{ color: 'var(--color-muted)' }}
                                >
                                    RSS Feed
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sitemap.xml"
                                    className="text-sm hover:text-white transition-colors"
                                    style={{ color: 'var(--color-muted)' }}
                                >
                                    Sitemap
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="text-sm hover:text-white transition-colors"
                                    style={{ color: 'var(--color-muted)' }}
                                >
                                    Admin Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: '1px solid var(--color-secondary)', color: 'var(--color-accent)' }}>
                    &copy; {currentYear} Chainew. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
