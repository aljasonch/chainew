import Link from "next/link";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import { ArticleCard } from "@/components/ArticleCard";
import { Badge } from "@/components/ui/Badge";

async function getLatestArticles() {
  await dbConnect();

  const articles = await Article.find({ status: "published" })
    .populate("authorId", "name")
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  return articles;
}

async function getCategories() {
  await dbConnect();

  const categories = await Article.distinct("category", {
    status: "published",
  });

  return categories;
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    getLatestArticles(),
    getCategories(),
  ]);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          Latest News
        </h1>
        <p className="text-zinc-500">
          Stay updated with the latest news and updates
        </p>
      </section>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            No articles yet
          </h2>
          <p className="text-zinc-500 mb-4">
            Articles will appear here once published.
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800"
          >
            Login to create articles
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <section className="mb-12">
              <ArticleCard
                article={JSON.parse(JSON.stringify(featuredArticle))}
                featured
              />
            </section>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link key={category} href={`/category/${category}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-zinc-300"
                    >
                      {category}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Articles Grid */}
          {otherArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-zinc-900 mb-4">
                More Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article) => (
                  <ArticleCard
                    key={String(article._id)}
                    article={JSON.parse(JSON.stringify(article))}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
