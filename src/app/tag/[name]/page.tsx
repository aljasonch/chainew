import { Metadata } from "next";
import { listPublishedByTag } from "@/lib/firestore";
import { ArticleCard } from "@/components/ArticleCard";

interface PageProps {
    params: Promise<{ name: string }>;
}

async function getArticlesByTag(tag: string) {
    return listPublishedByTag(tag);
}

export const revalidate = 300;

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    return {
        title: `Articles tagged "${decodedName}"`,
        description: `All articles tagged with ${decodedName}`,
    };
}

export default async function TagPage({ params }: PageProps) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const articles = await getArticlesByTag(decodedName);

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
                <p className="kicker">Tag</p>
                <h1 className="font-display mt-2 text-3xl font-black text-neutral-900 md:text-4xl">
                    {decodedName}
                </h1>
                <p className="mt-3 border-b-2 border-neutral-900 pb-6 text-sm text-neutral-500">
                    {articles.length} article{articles.length !== 1 ? "s" : ""} with this
                    tag
                </p>

                {articles.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-neutral-500">No articles found with this tag.</p>
                    </div>
                ) : (
                    <div className="mt-2">
                        {articles.map((article) => (
                            <ArticleCard
                                key={String(article._id)}
                                article={JSON.parse(JSON.stringify(article))}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
