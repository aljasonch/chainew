"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, AlertCircle, Newspaper } from "lucide-react";
import { NeuraFeedBadge } from "@/components/ui/NeuraFeedBadge";
import Link from "next/link";

interface NeuraFeedLiveArticle {
    id: string;
    title: string;
    summary: string;
    whyItMatters: string;
    topic: string;
    sources: string[];
    createdAt: string;
}

interface SyncResult {
    success: boolean;
    synced?: boolean;
    reason?: string;
    id?: string;
    slug?: string;
    topic?: string;
    category?: string;
    error?: string;
    message?: string;
}

interface ImportedArticle {
    _id: string;
    title: string;
    slug: string;
    topic?: string;
    createdAt: string;
    tags: string[];
}

export default function NeuraFeedAdminPage() {
    const [liveArticle, setLiveArticle] = useState<NeuraFeedLiveArticle | null>(null);
    const [importedArticles, setImportedArticles] = useState<ImportedArticle[]>([]);
    const [lastSync, setLastSync] = useState<{ id?: string; synced?: boolean; neuraFeedId?: string } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [loadingLive, setLoadingLive] = useState(true);
    const [loadingImported, setLoadingImported] = useState(true);

    // Fetch live NeuraFeed article
    const fetchLive = useCallback(async () => {
        setLoadingLive(true);
        try {
            const res = await fetch("https://neurafeed.vercel.app/api/latest-news");
            const data = await res.json();
            setLiveArticle(data.article ?? null);
        } catch {
            setLiveArticle(null);
        } finally {
            setLoadingLive(false);
        }
    }, []);

    // Fetch imported NeuraFeed articles from Chainew DB
    const fetchImported = useCallback(async () => {
        setLoadingImported(true);
        try {
            const res = await fetch("/api/articles?source=neurafeed&limit=20");
            const data = await res.json();
            setImportedArticles(data.data?.items ?? []);
        } catch {
            setImportedArticles([]);
        } finally {
            setLoadingImported(false);
        }
    }, []);

    // Fetch last sync info
    const fetchLastSync = useCallback(async () => {
        try {
            const res = await fetch("/api/neurafeed/sync");
            const data = await res.json();
            setLastSync(data.lastImport ?? null);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchLive();
        fetchImported();
        fetchLastSync();
    }, [fetchLive, fetchImported, fetchLastSync]);

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncResult(null);
        try {
            // 1. Manually check if there is new latest news
            const resLive = await fetch("https://neurafeed.vercel.app/api/latest-news");
            const dataLive = await resLive.json();
            const liveId = dataLive.article?.id;

            const resLocal = await fetch("/api/neurafeed/sync");
            const dataLocal = await resLocal.json();
            const localId = dataLocal.lastImport?.neuraFeedId;

            // 2. If there is none, just give visual feedback
            if (liveId && localId && liveId === localId) {
                setSyncResult({ 
                    success: true, 
                    synced: false, 
                    reason: "already_imported", 
                    message: "No new articles found. Everything is up to date." 
                });
                setIsSyncing(false);
                return;
            }

            // 3. If there is, pull the latest news
            const res = await fetch("/api/neurafeed/sync", { method: "POST" });
            const data: SyncResult = await res.json();
            setSyncResult(data);
            if (data.synced) {
                await fetchImported();
                await fetchLastSync();
            }
        } catch {
            setSyncResult({ success: false, error: "Failed to check or pull updates" });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                        <Zap size={20} className="text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                            NeuraFeed
                            <NeuraFeedBadge size="md" />
                        </h1>
                        <p className="text-zinc-500 text-sm">AI-powered news feed integration</p>
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Checking..." : "Check for Updates"}
                </button>
            </div>

            {/* Sync result banner */}
            {syncResult && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                    !syncResult.success
                        ? "bg-red-50 border-red-200 text-red-700"
                        : syncResult.synced
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                }`}>
                    {!syncResult.success ? (
                        <XCircle size={16} className="mt-0.5 shrink-0" />
                    ) : syncResult.synced ? (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    )}
                    <div>
                        {syncResult.synced && (
                            <p className="font-semibold">New article imported!</p>
                        )}
                        {syncResult.reason === "already_imported" && (
                            <p className="font-semibold">{syncResult.message || "No new articles found"}</p>
                        )}
                        {syncResult.reason === "stale" && (
                            <p className="font-semibold">Article is too old — skipped</p>
                        )}
                        {syncResult.error && (
                            <p className="font-semibold">{syncResult.error}</p>
                        )}
                        {syncResult.topic && (
                            <p className="mt-0.5 opacity-80">Topic: {syncResult.topic}</p>
                        )}
                        {syncResult.slug && (
                            <Link
                                href={`/article/${syncResult.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 mt-1 underline opacity-80 hover:opacity-100"
                            >
                                View article <ExternalLink size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live NeuraFeed preview */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                        <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                            </span>
                            Live from NeuraFeed
                        </h2>
                        <button
                            onClick={fetchLive}
                            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700"
                            title="Refresh"
                        >
                            <RefreshCw size={13} />
                        </button>
                    </div>

                    <div className="p-5">
                        {loadingLive ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                                <div className="h-3 bg-zinc-100 rounded w-full" />
                                <div className="h-3 bg-zinc-100 rounded w-5/6" />
                            </div>
                        ) : liveArticle ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium">
                                        {liveArticle.topic}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        <Clock size={10} className="inline mr-1" />
                                        {new Date(liveArticle.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-zinc-900 leading-snug">{liveArticle.title}</h3>
                                <p className="text-sm text-zinc-500 line-clamp-3">{liveArticle.summary}</p>
                                {liveArticle.whyItMatters && (
                                    <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-xs text-cyan-700">
                                        <span className="font-semibold">Why it matters: </span>
                                        {liveArticle.whyItMatters}
                                    </div>
                                )}
                                <div className="text-xs text-zinc-400">
                                    {liveArticle.sources.length} source{liveArticle.sources.length !== 1 ? "s" : ""} cited
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Could not fetch live article.</p>
                        )}
                    </div>
                </div>

                {/* Sync status */}
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-100">
                        <h2 className="font-semibold text-zinc-900">Sync Status</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Auto-check schedule</span>
                            <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">09:00 local (02:00 UTC)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Total imported</span>
                            <span className="font-semibold text-zinc-900">{importedArticles.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Last import ID</span>
                            <span className="font-mono text-xs text-zinc-400 truncate max-w-[140px]">
                                {typeof lastSync === "object" && lastSync !== null && "id" in lastSync
                                    ? String((lastSync as { id?: string }).id ?? "—")
                                    : "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">NeuraFeed endpoint</span>
                            <a
                                href="https://neurafeed.vercel.app/api/latest-news"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-600 hover:underline flex items-center gap-1"
                            >
                                /api/latest-news <ExternalLink size={10} />
                            </a>
                        </div>
                        <div className="pt-2 border-t border-zinc-100">
                            <p className="text-xs text-zinc-400">
                                Articles are auto-checked daily at <strong className="text-zinc-500">9:00 AM (02:00 UTC)</strong>.
                                Only pulled if NeuraFeed has new content since last import.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Imported articles list */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                        <Newspaper size={16} className="text-zinc-400" />
                        Imported Articles
                    </h2>
                    <span className="text-xs text-zinc-400">{importedArticles.length} total</span>
                </div>

                {loadingImported ? (
                    <div className="p-5 space-y-3 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-zinc-50 rounded-lg" />
                        ))}
                    </div>
                ) : importedArticles.length === 0 ? (
                    <div className="p-8 text-center">
                        <Zap size={32} className="text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm">No NeuraFeed articles imported yet.</p>
                        <p className="text-zinc-300 text-xs mt-1">Click &ldquo;Check for Updates&rdquo; to pull the latest article.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {importedArticles.map((article) => (
                            <div key={article._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <NeuraFeedBadge />
                                        {article.tags?.[0] && (
                                            <span className="text-xs text-zinc-400">
                                                {article.tags[0].replace(/-/g, " ")}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/admin/articles/${article._id}`}
                                        className="font-medium text-zinc-900 hover:underline truncate block text-sm"
                                    >
                                        {article.title}
                                    </Link>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {new Date(article.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        href={`/article/${article.slug}`}
                                        target="_blank"
                                        className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                                        title="View article"
                                    >
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
