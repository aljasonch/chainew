import Link from "next/link";

const categories = [
    "Technology",
    "Business",
    "Politics",
    "Sports",
    "Entertainment",
    "Health",
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="text-xl font-bold">
                            NewsPortal
                        </Link>
                        <p className="mt-4 text-zinc-400 text-sm max-w-md">
                            Your trusted source for the latest news and updates. Stay
                            informed with comprehensive coverage of technology, business,
                            politics, and more.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-4">Categories</h3>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/category/${category}`}
                                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/feed/rss.xml"
                                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    RSS Feed
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sitemap.xml"
                                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Sitemap
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    Admin Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-500">
                    &copy; {currentYear} NewsPortal. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
