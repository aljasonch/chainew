"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Edit, Trash2, X, ExternalLink } from "lucide-react";

interface Source {
    _id: string;
    name: string;
    url: string;
    createdAt: string;
}

interface PaginatedResponse {
    items: Source[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function SourcesPage() {
    const [sources, setSources] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [formData, setFormData] = useState({ name: "", url: "" });
    const [saving, setSaving] = useState(false);

    const fetchSources = useCallback(async () => {
        try {
            const res = await fetch("/api/sources");
            const data = await res.json();
            if (data.success) {
                setSources(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch sources:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSources();
    }, [fetchSources]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = editingSource ? "PUT" : "POST";
            const body = editingSource
                ? { id: editingSource._id, ...formData }
                : formData;

            const res = await fetch("/api/sources", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                setShowForm(false);
                setEditingSource(null);
                setFormData({ name: "", url: "" });
                fetchSources();
            } else {
                alert(data.error || "Failed to save source");
            }
        } catch (error) {
            console.error("Failed to save source:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this source?")) return;

        try {
            const res = await fetch(`/api/sources?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                fetchSources();
            }
        } catch (error) {
            console.error("Failed to delete source:", error);
        }
    };

    const openEditForm = (source: Source) => {
        setEditingSource(source);
        setFormData({ name: source.name, url: source.url });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingSource(null);
        setFormData({ name: "", url: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Sources</h1>
                    <p className="text-zinc-500">Manage reference sources for articles</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    New Source
                </Button>
            </div>

            {/* Source Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {editingSource ? "Edit Source" : "New Source"}
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={closeForm}>
                                <X size={18} />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="Source name"
                                    required
                                />
                                <Input
                                    label="URL"
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, url: e.target.value }))
                                    }
                                    placeholder="https://example.com"
                                    required
                                />
                                <div className="flex gap-3 justify-end">
                                    <Button type="button" variant="outline" onClick={closeForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-8 text-zinc-500">
                        Loading...
                    </div>
                ) : sources?.items.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-zinc-500">
                        No sources found. Add your first source!
                    </div>
                ) : (
                    sources?.items.map((source) => (
                        <Card key={source._id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-zinc-900 truncate">
                                            {source.name}
                                        </h3>
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-zinc-500 hover:text-zinc-900 truncate flex items-center gap-1"
                                        >
                                            {source.url.replace(/^https?:\/\//, "").slice(0, 30)}...
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditForm(source)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(source._id)}
                                        >
                                            <Trash2 size={16} className="text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
