"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface Article {
    _id: string;
    title: string;
    slug: string;
    category: string;
    status: "draft" | "review" | "published";
    authorId: { name: string; email: string };
    createdAt: string;
    publishedAt?: string;
}

interface PaginatedResponse {
    items: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "10");
            if (search) params.set("search", search);
            if (status) params.set("status", status);

            const res = await fetch(`/api/articles?${params}`);
            const data = await res.json();

            if (data.success) {
                setArticles(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                fetchArticles();
            }
        } catch (error) {
            console.error("Failed to delete article:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Articles</h1>
                    <p className="text-zinc-500">Manage your news articles</p>
                </div>
                <Link href="/admin/articles/new">
                    <Button>
                        <Plus size={18} />
                        New Article
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                        { value: "", label: "All Status" },
                        { value: "draft", label: "Draft" },
                        { value: "review", label: "In Review" },
                        { value: "published", label: "Published" },
                    ]}
                    className="w-full sm:w-48"
                />
            </div>

            {/* Articles Table */}
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600">
                                    Title
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 hidden md:table-cell">
                                    Category
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 hidden sm:table-cell">
                                    Author
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 hidden lg:table-cell">
                                    Date
                                </th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-zinc-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : articles?.items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                                        No articles found
                                    </td>
                                </tr>
                            ) : (
                                articles?.items.map((article) => (
                                    <tr key={article._id} className="hover:bg-zinc-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-zinc-900 truncate max-w-[200px] lg:max-w-[300px]">
                                                {article.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 hidden md:table-cell">
                                            {article.category}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 hidden sm:table-cell">
                                            {article.authorId?.name}
                                        </td>
                                        <td className="px-4 py-3">
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
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 hidden lg:table-cell">
                                            {formatDateShort(article.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.push(`/admin/articles/${article._id}`)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(article._id)}
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {articles && articles.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200">
                        <p className="text-sm text-zinc-500">
                            Showing {(page - 1) * 10 + 1} to{" "}
                            {Math.min(page * 10, articles.total)} of {articles.total} articles
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="text-sm text-zinc-600">
                                Page {page} of {articles.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === articles.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
