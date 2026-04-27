import { Metadata } from "next";
import { listPublishedByCategory } from "@/lib/firestore";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 9;

interface PageProps {
    params: Promise<{ name: string }>;
    searchParams: Promise<{ page?: string }>;
}

const categoryMapping: Record<string, string> = {
    "tech": "Tech",
    "ai-ml": "Tech",
    "finance": "Finance",
    "blockchain": "Blockchain",
    "public-affairs": "Public Affairs",
};

async function getArticlesByCategory(slug: string, page: number) {
    const categoryName = categoryMapping[slug.toLowerCase()] || decodeURIComponent(slug);
    const { items: articles, total } = await listPublishedByCategory(
        categoryName,
        page,
        ITEMS_PER_PAGE,
    );

    return {
        articles,
        categoryName,
        total,
        totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
    };
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { name } = await params;
    const categoryName = categoryMapping[name.toLowerCase()] || decodeURIComponent(name);

    return {
        title: `${categoryName} News`,
        description: `Latest news and updates in ${categoryName}`,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { name } = await params;
    const query = await searchParams;
    const currentPage = Math.max(1, parseInt(query.page || "1") || 1);
    const { articles, categoryName, total, totalPages } = await getArticlesByCategory(name, currentPage);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                    {categoryName}
                </h1>
                <p className="text-zinc-500">
                    {total} article{total !== 1 ? "s" : ""} in this
                    category
                </p>
            </header>

            {total === 0 ? (
                <div className="text-center py-16">
                    <p className="text-zinc-500">No articles found in this category.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <ArticleCard
                                key={String(article._id)}
                                article={JSON.parse(JSON.stringify(article))}
                            />
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <p className="mt-8 text-center text-zinc-500">
                            No articles on this page.
                        </p>
                    )}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        basePath={`/category/${encodeURIComponent(name)}`}
                    />
                </>
            )}
        </div>
    );
}
