import { Metadata } from "next";
import { listPublishedByCategory } from "@/lib/firestore";
import { ArticleCard } from "@/components/ArticleCard";

interface PageProps {
    params: Promise<{ name: string }>;
}

const categoryMapping: Record<string, string> = {
    "ai-ml": "AI & ML",
    "finance": "Finance",
    "blockchain": "Blockchain",
    "public-affairs": "Public Affairs",
};

async function getArticlesByCategory(slug: string) {
    const categoryName = categoryMapping[slug.toLowerCase()] || decodeURIComponent(slug);
    const articles = await listPublishedByCategory(categoryName);

    return { articles, categoryName };
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

export default async function CategoryPage({ params }: PageProps) {
    const { name } = await params;
    const { articles, categoryName } = await getArticlesByCategory(name);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                    {categoryName}
                </h1>
                <p className="text-zinc-500">
                    {articles.length} article{articles.length !== 1 ? "s" : ""} in this
                    category
                </p>
            </header>

            {articles.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-zinc-500">No articles found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <ArticleCard
                            key={String(article._id)}
                            article={JSON.parse(JSON.stringify(article))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
