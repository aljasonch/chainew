"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface User {
    _id: string;
    email: string;
    name: string;
    role: "admin" | "editor" | "author";
    createdAt: string;
}

interface PaginatedResponse {
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "author" as "admin" | "editor" | "author",
    });
    const [saving, setSaving] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = editingUser ? "PUT" : "POST";
            const body = editingUser
                ? { id: editingUser._id, ...formData }
                : formData;

            const res = await fetch("/api/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                setShowForm(false);
                setEditingUser(null);
                setFormData({ name: "", email: "", password: "", role: "author" });
                fetchUsers();
            } else {
                alert(data.error || "Failed to save user");
            }
        } catch (error) {
            console.error("Failed to save user:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                fetchUsers();
            } else {
                alert(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const openEditForm = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "author" });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
                    <p className="text-zinc-500">Manage user accounts and roles</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    New User
                </Button>
            </div>

            {/* User Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingUser ? "Edit User" : "New User"}</CardTitle>
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
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    required
                                />
                                <Input
                                    label={
                                        editingUser ? "Password (leave empty to keep current)" : "Password"
                                    }
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    required={!editingUser}
                                />
                                <Select
                                    label="Role"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            role: e.target.value as "admin" | "editor" | "author",
                                        }))
                                    }
                                    options={[
                                        { value: "author", label: "Author" },
                                        { value: "editor", label: "Editor" },
                                        { value: "admin", label: "Admin" },
                                    ]}
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

            {/* Users Table */}
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600">
                                Name
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 hidden sm:table-cell">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600">
                                Role
                            </th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-zinc-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : users?.items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users?.items.map((user) => (
                                <tr key={user._id} className="hover:bg-zinc-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-zinc-900">{user.name}</div>
                                        <div className="text-sm text-zinc-500 sm:hidden">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600 hidden sm:table-cell">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                user.role === "admin"
                                                    ? "default"
                                                    : user.role === "editor"
                                                        ? "secondary"
                                                        : "secondary"
                                            }
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditForm(user)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(user._id)}
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
        </div>
    );
}
