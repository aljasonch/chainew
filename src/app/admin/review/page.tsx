"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, X, Eye } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface Article {
    _id: string;
    title: string;
    slug: string;
    category: string;
    authorId: { name: string; email: string };
    createdAt: string;
    summary: string;
}

export default function ReviewQueuePage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = useCallback(async () => {
        try {
            const res = await fetch("/api/articles?status=review&limit=50");
            const data = await res.json();
            if (data.success) {
                setArticles(data.data.items);
            }
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const updateStatus = async (id: string, status: "published" | "draft") => {
        try {
            const res = await fetch("/api/articles", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            const data = await res.json();

            if (data.success) {
                fetchArticles();
            }
        } catch (error) {
            console.error("Failed to update article:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Review Queue</h1>
                <p className="text-zinc-500">
                    Articles waiting for review and approval
                </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-500">Loading...</div>
                ) : articles.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        No articles pending review
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200">
                        {articles.map((article) => (
                            <div key={article._id} className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary">{article.category}</Badge>
                                            <span className="text-sm text-zinc-500">
                                                {formatDateShort(article.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 mb-2">
                                            by {article.authorId?.name}
                                        </p>
                                        <p className="text-zinc-600 text-sm line-clamp-2">
                                            {article.summary}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                                        <Link href={`/admin/articles/${article._id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye size={16} />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateStatus(article._id, "draft")}
                                        >
                                            <X size={16} className="text-red-600" />
                                            <span className="hidden sm:inline">Reject</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateStatus(article._id, "published")}
                                        >
                                            <Check size={16} />
                                            <span className="hidden sm:inline">Approve</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
