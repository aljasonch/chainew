import { auth } from "@/app/api/auth/session/route";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/firestore";
import { StatsCard } from "@/components/admin/StatsCard";
import { FileText, Users, ClipboardCheck, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";

async function getStats() {
    return getDashboardStats();
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const stats = await getStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
                <p className="text-zinc-500">Welcome back, {session.user.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Articles"
                    value={stats.totalArticles}
                    icon={FileText}
                />
                <StatsCard
                    title="Published"
                    value={stats.publishedArticles}
                    icon={Eye}
                />
                <StatsCard
                    title="Pending Review"
                    value={stats.pendingReview}
                    icon={ClipboardCheck}
                />
                <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
            </div>

            {/* Recent Articles */}
            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        Recent Articles
                    </h2>
                    <Link
                        href="/admin/articles"
                        className="text-sm text-zinc-600 hover:text-zinc-900"
                    >
                        View all
                    </Link>
                </div>
                <div className="divide-y divide-zinc-200">
                    {stats.recentArticles.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500">
                            No articles yet. Create your first article!
                        </div>
                    ) : (
                        stats.recentArticles.map((article) => (
                            <div
                                key={String(article._id)}
                                className="p-4 flex items-center justify-between hover:bg-zinc-50"
                            >
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/admin/articles/${article._id}`}
                                        className="font-medium text-zinc-900 hover:underline truncate block"
                                    >
                                        {article.title}
                                    </Link>
                                    <p className="text-sm text-zinc-500">
                                        by{" "}
                                        {article.authorId &&
                                            typeof article.authorId === "object" &&
                                            "name" in article.authorId
                                            ? String(article.authorId.name)
                                            : "Unknown"}{" "}
                                        | {formatDateShort(article.createdAt)}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        article.status === "published"
                                            ? "success"
                                            : article.status === "review"
                                                ? "warning"
                                                : "secondary"
                                    }
                                >
                                    {article.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                    href="/admin/articles/new"
                    className="bg-zinc-900 text-white rounded-lg p-6 hover:bg-zinc-800 transition-colors"
                >
                    <FileText className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold">New Article</h3>
                    <p className="text-sm text-zinc-300 mt-1">
                        Create a new news article
                    </p>
                </Link>
                <Link
                    href="/admin/review"
                    className="bg-white border border-zinc-200 rounded-lg p-6 hover:border-zinc-400 transition-colors"
                >
                    <ClipboardCheck className="w-8 h-8 mb-3 text-zinc-600" />
                    <h3 className="font-semibold text-zinc-900">Review Queue</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        {stats.pendingReview} articles pending review
                    </p>
                </Link>
                <Link
                    href="/"
                    target="_blank"
                    className="bg-white border border-zinc-200 rounded-lg p-6 hover:border-zinc-400 transition-colors"
                >
                    <Eye className="w-8 h-8 mb-3 text-zinc-600" />
                    <h3 className="font-semibold text-zinc-900">View Site</h3>
                    <p className="text-sm text-zinc-500 mt-1">Open the public website</p>
                </Link>
            </div>
        </div>
    );
}
