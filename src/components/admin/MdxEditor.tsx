"use client";

import { useState } from "react";
import { Eye, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/Textarea";

interface MdxEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function MdxEditor({ value, onChange, className }: MdxEditorProps) {
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    // Simple markdown to HTML converter for preview
    const renderPreview = (mdx: string) => {
        let html = mdx
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
            // Italic
            .replace(/\*(.*)\*/gim, "<em>$1</em>")
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 underline">$1</a>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
            // Code blocks
            .replace(/```([\s\S]*?)```/gim, '<pre class="bg-zinc-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code class="bg-zinc-100 px-1 rounded">$1</code>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-zinc-300 pl-4 italic my-4">$1</blockquote>')
            // Unordered lists
            .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
            // Paragraphs
            .replace(/\n\n/gim, "</p><p class=\"my-4\">")
            // Line breaks
            .replace(/\n/gim, "<br />");

        return `<p class="my-4">${html}</p>`;
    };

    return (
        <div className={cn("border border-zinc-200 rounded-lg overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-zinc-200 bg-zinc-50">
                <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors",
                        mode === "edit"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-200"
                    )}
                >
                    <Edit2 size={14} />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors",
                        mode === "preview"
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-200"
                    )}
                >
                    <Eye size={14} />
                    Preview
                </button>
            </div>

            {/* Editor / Preview */}
            {mode === "edit" ? (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write your article content in MDX format..."
                    className="border-0 rounded-none min-h-[400px] focus:ring-0"
                />
            ) : (
                <div
                    className="p-4 min-h-[400px] prose prose-zinc max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                />
            )}
        </div>
    );
}
