import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, Zap, Sparkles, Cpu, DollarSign, Coins, Building2, Newspaper } from "lucide-react";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import "@/models/User";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, React.ElementType> = {
  "AI & ML": Cpu,
  "Finance": DollarSign,
  "Blockchain": Coins,
  "Public Affairs": Building2,
};

const categories = [
  { name: "AI & ML", icon: Cpu },
  { name: "Finance", icon: DollarSign },
  { name: "Blockchain", icon: Coins },
  { name: "Public Affairs", icon: Building2 },
];

async function getHomePageData() {
  await dbConnect();

  const [featuredArticles, latestArticles, categoryCounts] = await Promise.all([
    Article.find({ status: "published" })
      .populate("authorId", "name")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),
    Article.find({ status: "published" })
      .populate("authorId", "name")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),
    Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = Object.fromEntries(
    categoryCounts.map((c: { _id: string; count: number }) => [c._id, c.count])
  );

  return {
    featuredArticles: JSON.parse(JSON.stringify(featuredArticles)),
    latestArticles: JSON.parse(JSON.stringify(latestArticles)),
    categoryCounts: countMap,
  };
}

export default async function HomePage() {
  const { featuredArticles, latestArticles, categoryCounts } = await getHomePageData();
  const hasArticles = featuredArticles.length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary clip-diagonal hidden lg:block" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6 animate-fadeIn">
              <Zap className="text-muted" size={20} />
              <span className="text-muted text-sm font-medium tracking-widest uppercase">
                Hot News
              </span>
            </div>

            {hasArticles ? (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-inverse leading-tight mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                  {featuredArticles[0].title.split(' ').slice(0, 5).join(' ')}...
                </h1>

                <p className="text-2xl md:text-4xl text-muted font-light mb-8 animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                  {featuredArticles[0].summary?.slice(0, 100)}...
                </p>

                <Link
                  href={`/article/${featuredArticles[0].slug}`}
                  className="inline-flex items-center gap-2 bg-card text-primary px-6 py-3 rounded-full font-semibold hover:bg-muted transition-colors group animate-fadeInUp stagger-2"
                  style={{ animationFillMode: 'forwards' }}
                >
                  Read Full Story
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-inverse leading-none mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                  CHAINEW
                </h1>

                <p className="text-2xl md:text-4xl text-muted font-light mb-8 animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                  Your Trusted General News Source
                </p>

                <p className="text-muted animate-fadeInUp stagger-2" style={{ animationFillMode: 'forwards' }}>
                  No articles published yet. Create your first article in the admin dashboard.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Explore Topics</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat, index) => (
            <Link
              key={cat.name}
              href={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="group flex flex-col items-center p-4 rounded-xl transition-all duration-200 hover-lift animate-fadeInUp w-[140px] shrink-0"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'forwards',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)'
              }}
            >
              <cat.icon className="text-accent group-hover:text-primary transition-colors mb-2" size={24} />
              <span className="text-xs font-medium text-primary text-center">{cat.name}</span>
              <span className="text-xs text-secondary">{categoryCounts[cat.name] || 0}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredArticles.length > 1 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {featuredArticles[0] && (
              <Link
                href={`/article/${featuredArticles[0].slug}`}
                className="md:col-span-2 row-span-2 relative group overflow-hidden rounded-3xl bg-primary p-6 md:p-8 flex flex-col justify-end hover-lift animate-fadeInUp"
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="absolute top-4 right-4 z-30">
                  <Badge variant="secondary">{featuredArticles[0].category}</Badge>
                </div>
                {(() => {
                  const Icon = categoryIcons[featuredArticles[0].category] || Newspaper;
                  return <Icon className="absolute top-8 left-8 text-accent opacity-20" size={120} />;
                })()}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-primary)_10%,transparent_100%)] z-10 opacity-95" />
                <div className="relative z-20 mt-auto pt-16">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-inverse mb-2 line-clamp-3">
                    {featuredArticles[0].title}
                  </h2>
                  <p className="text-muted line-clamp-2 text-sm md:text-base">{featuredArticles[0].summary}</p>
                </div>
                <ArrowUpRight className="absolute bottom-6 right-6 text-accent opacity-0 group-hover:opacity-100 transition-opacity z-20" size={32} />
              </Link>
            )}

            {featuredArticles.slice(1, 4).map((article: { _id: string; slug: string; category: string; title: string }, index: number) => {
              const Icon = categoryIcons[article.category] || Newspaper;
              const bgColors = ['bg-secondary', 'bg-accent', 'bg-muted'];
              const isLight = index === 2;

              return (
                <Link
                  key={article._id}
                  href={`/article/${article.slug}`}
                  className={`relative group overflow-hidden rounded-3xl ${bgColors[index]} p-6 flex flex-col justify-between hover-lift animate-fadeInUp stagger-${index + 1} ${index === 2 ? 'md:col-span-2' : ''}`}
                  style={{ animationFillMode: 'forwards' }}
                >
                  <Badge variant={isLight ? "default" : "secondary"} className="w-fit">{article.category}</Badge>
                  <Icon className={`absolute top-4 right-4 ${isLight ? 'text-primary' : 'text-inverse'} opacity-30`} size={48} />
                  <div>
                    <h3 className={`text-xl font-bold ${isLight ? 'text-primary' : 'text-inverse'}`}>{article.title}</h3>
                    <ArrowUpRight className={`absolute bottom-4 right-4 ${isLight ? 'text-primary' : 'text-muted'} opacity-0 group-hover:opacity-100 transition-opacity`} size={24} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {latestArticles.length > 0 && (
        <section className="bg-primary py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-inverse flex items-center gap-2">
                <Sparkles className="text-muted" size={20} />
                Latest Articles
              </h2>
              <Link href="/latest" className="text-inverse text-sm hover:text-muted transition-colors">
                View All
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {latestArticles.map((article: { _id: string; slug: string; category: string; title: string }) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug}`}
                  className="shrink-0 w-72 bg-secondary border border-[var(--color-accent)]/30 rounded-2xl p-5 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-inverse group-hover:text-muted transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-secondary isolate">

          <div className="grid lg:grid-cols-5 gap-12 p-8 md:p-16 relative z-10">
            <div className="lg:col-span-3 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary border border-primary w-fit mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs font-medium text-inverse uppercase tracking-wider">Weekly Newsletter</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-inverse mb-6 leading-tight">
                Stay Ahead of the <br />
                <span className="text-white">Tech Curve</span>
              </h2>

              <p className="text-inverse text-lg mb-8 max-w-md leading-relaxed opacity-90">
                Join our community of forward-thinkers. Get curated news, deep dives, and trends delivered weekly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:border-white focus:outline-none flex-1 transition-all"
                />
                <button className="px-8 py-4 bg-white text-secondary rounded-xl font-bold hover:bg-accent hover:text-white transition-all shadow-lg">
                  Join Now
                </button>
              </div>
              <p className="mt-4 text-xs text-muted">
                No spam, unsubscribe at any time.
              </p>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-center lg:border-l lg:border-primary lg:pl-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                <div className="group p-6 rounded-2xl bg-primary hover:bg-primary/80 transition-colors border border-primary">
                  <div className="text-5xl font-black text-inverse mb-2 group-hover:scale-110 transition-transform origin-left duration-300">
                    {featuredArticles.length + latestArticles.length}+
                  </div>
                  <div className="text-muted font-medium">Published Articles</div>
                  <div className="w-12 h-1 bg-accent rounded-full mt-4 group-hover:w-full transition-all duration-500"></div>
                </div>

                <div className="group p-6 rounded-2xl bg-primary hover:bg-primary/80 transition-colors border border-primary">
                  <div className="text-5xl font-black text-inverse mb-2 group-hover:scale-110 transition-transform origin-left duration-300">
                    {categories.length}
                  </div>
                  <div className="text-muted font-medium">Active Categories</div>
                  <div className="w-12 h-1 bg-secondary rounded-full mt-4 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
