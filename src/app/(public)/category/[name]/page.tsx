import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { ArticleCard } from "@/components/ArticleCard";

interface PageProps {
    params: Promise<{ name: string }>;
}

async function getArticlesByCategory(category: string) {
    await dbConnect();

    const articles = await Article.find({
        status: "published",
        category: { $regex: new RegExp(`^${category}$`, "i") },
    })
        .populate("authorId", "name")
        .sort({ publishedAt: -1 })
        .limit(50)
        .lean();

    return articles;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    return {
        title: `${decodedName} News`,
        description: `Latest news and updates in ${decodedName}`,
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const articles = await getArticlesByCategory(decodedName);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                    {decodedName}
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
