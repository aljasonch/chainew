"use client";

import { useState } from "react";
import { Eye, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/Textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { reactMarkdownComponents } from "@/components/markdown/components";

interface MdxEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function MdxEditor({ value, onChange, className }: MdxEditorProps) {
    const [mode, setMode] = useState<"edit" | "preview">("edit");

    return (
        <div className={cn("border border-zinc-200 rounded-lg overflow-hidden", className)}>
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

            {mode === "edit" ? (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write your article content in MDX format..."
                    className="border-0 rounded-none min-h-[400px] focus:ring-0"
                />
            ) : (
                <div className="p-4 min-h-[400px] max-w-none prose">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={reactMarkdownComponents}
                    >
                        {value}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
}
