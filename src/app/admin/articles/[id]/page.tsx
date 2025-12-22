"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { MdxEditor } from "@/components/admin/MdxEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, Save, Plus, X, Share2 } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface ArticleSource {
    name: string;
    url: string;
}

interface ArticleFormData {
    title: string;
    subtitle: string;
    slug: string;
    summary: string;
    category: string;
    tags: string[];
    content_mdx: string;
    status: "draft" | "review" | "published";
    sources: ArticleSource[];
    seo: {
        metaTitle: string;
        metaDescription: string;
        ogImageUrl: string;
    };
}

const categories = [
    "AI & ML",
    "Finance",
    "Blockchain",
    "Public Affairs",
];

export default function ArticleEditorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const isNew = resolvedParams.id === "new";
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [importJson, setImportJson] = useState("");
    const [importError, setImportError] = useState<string | null>(null);
    const [isSlugManuallySet, setIsSlugManuallySet] = useState(false);
    const [form, setForm] = useState<ArticleFormData>({
        title: "",
        subtitle: "",
        slug: "",
        summary: "",
        category: categories[0],
        tags: [],
        content_mdx: "",
        status: "draft",
        sources: [],
        seo: {
            metaTitle: "",
            metaDescription: "",
            ogImageUrl: "",
        },
    });

    const isRecord = (value: unknown): value is Record<string, unknown> => {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    };

    const applyImportedArticle = (raw: unknown) => {
        const candidate = Array.isArray(raw)
            ? raw[0]
            : isRecord(raw) && "article" in raw
                ? raw["article"]
                : raw;

        if (!isRecord(candidate)) {
            throw new Error("JSON must be an object (or array of objects)");
        }

        const article = candidate;

        const title = typeof article["title"] === "string" ? article["title"] : "";
        const subtitle =
            typeof article["subtitle"] === "string" ? article["subtitle"] : "";
        const summary =
            typeof article["summary"] === "string" ? article["summary"] : "";

        const content_mdx =
            typeof article["content_mdx"] === "string"
                ? article["content_mdx"]
                : typeof article["mdx"] === "string"
                    ? article["mdx"]
                    : typeof article["content"] === "string"
                        ? article["content"]
                        : "";

        const hasExplicitSlug = typeof article["slug"] === "string" && !!article["slug"].trim();
        const nextSlug: string = hasExplicitSlug
            ? (article["slug"] as string)
            : title
                ? slugify(title)
                : "";

        // Track if slug was explicitly provided in JSON
        if (hasExplicitSlug) {
            setIsSlugManuallySet(true);
        }

        const nextCategory =
            typeof article["category"] === "string" && article["category"].trim()
                ? article["category"]
                : categories[0];

        const nextTags = Array.isArray(article["tags"])
            ? (article["tags"].filter((t) => typeof t === "string") as string[])
            : typeof article["tags"] === "string"
                ? article["tags"]
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [];

        const nextStatus =
            article["status"] === "draft" ||
                article["status"] === "review" ||
                article["status"] === "published"
                ? (article["status"] as ArticleFormData["status"])
                : "draft";

        const nextSources = Array.isArray(article["sources"])
            ? (article["sources"]
                .filter((s) => isRecord(s))
                .map((s) => ({
                    name: typeof s["name"] === "string" ? s["name"] : "",
                    url: typeof s["url"] === "string" ? s["url"] : "",
                })) as ArticleSource[])
            : [];

        const incomingSeo =
            isRecord(article["seo"])
                ? article["seo"]
                : {};

        const metaTitle =
            typeof incomingSeo["metaTitle"] === "string" &&
                incomingSeo["metaTitle"].trim()
                ? incomingSeo["metaTitle"]
                : title;

        const metaDescription =
            typeof incomingSeo["metaDescription"] === "string" &&
                incomingSeo["metaDescription"].trim()
                ? incomingSeo["metaDescription"]
                : summary;

        const ogImageUrl =
            typeof incomingSeo["ogImageUrl"] === "string"
                ? incomingSeo["ogImageUrl"]
                : "";

        setForm((prev) => ({
            ...prev,
            title: title || prev.title,
            subtitle: subtitle || prev.subtitle,
            slug: nextSlug || prev.slug,
            summary: summary || prev.summary,
            category: categories.includes(nextCategory) ? nextCategory : prev.category,
            tags: nextTags.length ? nextTags : prev.tags,
            content_mdx: content_mdx || prev.content_mdx,
            status: nextStatus,
            sources: nextSources.length ? nextSources : prev.sources,
            seo: {
                metaTitle: metaTitle || prev.seo.metaTitle,
                metaDescription: metaDescription || prev.seo.metaDescription,
                ogImageUrl: ogImageUrl || prev.seo.ogImageUrl,
            },
        }));
    };

    const handleApplyImportJson = () => {
        setImportError(null);
        try {
            const parsed = JSON.parse(importJson);
            applyImportedArticle(parsed);
        } catch (e) {
            setImportError(e instanceof Error ? e.message : "Invalid JSON");
        }
    };

    const handleImportFile = async (file: File | null) => {
        if (!file) return;
        setImportError(null);
        try {
            const text = await file.text();
            setImportJson(text);
            const parsed = JSON.parse(text);
            applyImportedArticle(parsed);
        } catch (e) {
            setImportError(e instanceof Error ? e.message : "Failed to read JSON file");
        }
    };

    useEffect(() => {
        if (!isNew) {
            fetchArticle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);

    const fetchArticle = async () => {
        try {
            const res = await fetch(`/api/articles/${resolvedParams.id}`);
            const data = await res.json();

            if (data.success) {
                const article = data.data;
                setForm({
                    title: article.title || "",
                    subtitle: article.subtitle || "",
                    slug: article.slug || "",
                    summary: article.summary || "",
                    category: article.category || categories[0],
                    tags: article.tags || [],
                    content_mdx: article.content_mdx || "",
                    status: article.status || "draft",
                    sources: article.sources || [],
                    seo: {
                        metaTitle: article.seo?.metaTitle || "",
                        metaDescription: article.seo?.metaDescription || "",
                        ogImageUrl: article.seo?.ogImageUrl || "",
                    },
                });
            }
        } catch (error) {
            console.error("Failed to fetch article:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = isNew ? "/api/articles" : "/api/articles";
            const method = isNew ? "POST" : "PUT";
            const body = isNew ? form : { id: resolvedParams.id, ...form };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                router.push("/admin/articles");
            } else {
                alert(data.error || "Failed to save article");
            }
        } catch (error) {
            console.error("Failed to save article:", error);
            alert("Failed to save article");
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (title: string, autoSlug: boolean = true) => {
        setForm((prev) => ({
            ...prev,
            title,
            slug: isNew && autoSlug && !isSlugManuallySet && (!prev.slug || prev.slug === slugify(prev.title))
                ? slugify(title)
                : prev.slug,
            seo: {
                ...prev.seo,
                metaTitle: prev.seo.metaTitle || title,
            },
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }));
    };

    const handleAddSource = () => {
        setForm((prev) => ({
            ...prev,
            sources: [...prev.sources, { name: "", url: "" }],
        }));
    };

    const handleUpdateSource = (
        index: number,
        field: "name" | "url",
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            sources: prev.sources.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            ),
        }));
    };

    const handleRemoveSource = (index: number) => {
        setForm((prev) => ({
            ...prev,
            sources: prev.sources.filter((_, i) => i !== index),
        }));
    };

    const handleShareToDiscord = async () => {
        if (isNew) {
            alert("Please save the article first before sharing to Discord");
            return;
        }

        if (form.status !== "published") {
            alert("Article must be published before sharing to Discord");
            return;
        }

        setSharing(true);
        try {
            const res = await fetch(`/api/articles/${resolvedParams.id}/discord`, {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                alert("Article shared to Discord successfully!");
            } else {
                alert(data.error || "Failed to share to Discord");
            }
        } catch (error) {
            console.error("Failed to share to Discord:", error);
            alert("Failed to share to Discord");
        } finally {
            setSharing(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/articles">
                        <Button type="button" variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            {isNew ? "New Article" : "Edit Article"}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={form.status}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                status: e.target.value as "draft" | "review" | "published",
                            }))
                        }
                        options={[
                            { value: "draft", label: "Draft" },
                            { value: "review", label: "Submit for Review" },
                            { value: "published", label: "Published" },
                        ]}
                        className="w-40"
                    />
                    <Button type="submit" disabled={saving}>
                        <Save size={18} />
                        {saving ? "Saving..." : "Save"}
                    </Button>
                    {!isNew && form.status === "published" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleShareToDiscord}
                            disabled={sharing}
                        >
                            <Share2 size={18} />
                            {sharing ? "Sharing..." : "Share to Discord"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import from JSON</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                type="file"
                                accept="application/json,.json"
                                label="JSON File (.json)"
                                onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
                            />
                            <Textarea
                                label="Paste JSON"
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                placeholder={`{\n  "title": "...",\n  "slug": "custom-url-slug",\n  "summary": "...",\n  "category": "AI & ML",\n  "tags": ["tag1", "tag2"],\n  "content_mdx": "# Heading\\n...",\n  "status": "draft",\n  "sources": [{"name":"...","url":"https://..."}],\n  "seo": {\n    "metaTitle": "...",\n    "metaDescription": "...",\n    "ogImageUrl": ""\n  }\n}`}
                                className="min-h-[180px]"
                                spellCheck={false}
                            />
                            {importError && (
                                <p className="text-sm text-red-600">{importError}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={handleApplyImportJson}>
                                    Apply JSON
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setImportJson("");
                                        setImportError(null);
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Import only fills in the form. Click Save to store the data in the database
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Article Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Title"
                                value={form.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Enter article title"
                                required
                            />
                            <Input
                                label="Subtitle"
                                value={form.subtitle}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, subtitle: e.target.value }))
                                }
                                placeholder="Optional subtitle"
                            />
                            <Input
                                label="Slug"
                                value={form.slug}
                                onChange={(e) => {
                                    setForm((prev) => ({ ...prev, slug: e.target.value }));
                                    setIsSlugManuallySet(true);
                                }}
                                placeholder="url-friendly-slug"
                                required
                            />
                            <Textarea
                                label="Summary"
                                value={form.summary}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, summary: e.target.value }))
                                }
                                placeholder="Brief summary of the article"
                                required
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content (MDX)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MdxEditor
                                value={form.content_mdx}
                                onChange={(value) =>
                                    setForm((prev) => ({ ...prev, content_mdx: value }))
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Sources</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddSource}>
                                <Plus size={16} />
                                Add Source
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {form.sources.length === 0 ? (
                                <p className="text-sm text-zinc-500">No sources added yet.</p>
                            ) : (
                                form.sources.map((source, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Input
                                            placeholder="Source name"
                                            value={source.name}
                                            onChange={(e) =>
                                                handleUpdateSource(index, "name", e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="URL"
                                            value={source.url}
                                            onChange={(e) =>
                                                handleUpdateSource(index, "url", e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveSource(index)}
                                        >
                                            <X size={16} className="text-red-600" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category & Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                label="Category"
                                value={form.category}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, category: e.target.value }))
                                }
                                options={categories.map((c) => ({ value: c, label: c }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Tags
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        placeholder="Add tag"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                    />
                                    <Button type="button" variant="outline" onClick={handleAddTag}>
                                        Add
                                    </Button>
                                </div>
                                {form.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-zinc-100 rounded"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:text-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Meta Title"
                                value={form.seo.metaTitle}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        seo: { ...prev.seo, metaTitle: e.target.value },
                                    }))
                                }
                                placeholder="SEO title"
                            />
                            <Textarea
                                label="Meta Description"
                                value={form.seo.metaDescription}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        seo: { ...prev.seo, metaDescription: e.target.value },
                                    }))
                                }
                                placeholder="SEO description"
                                className="min-h-[80px]"
                            />
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    OG Image
                                </label>
                                <ImageUpload
                                    value={form.seo.ogImageUrl}
                                    onChange={(url) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            seo: { ...prev.seo, ogImageUrl: url },
                                        }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
