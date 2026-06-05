"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (value: { url: string; publicId?: string }) => void;
    className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        if (file.size > 500 * 1024) {
            setError("Image must be less than 500KB");
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
            });

            if (!signRes.ok) {
                throw new Error("Failed to get upload signature");
            }

            const signPayload = await signRes.json();
            const signData = signPayload?.data as
                | {
                    timestamp: number;
                    signature: string;
                    uploadPreset: string;
                    cloudName: string;
                    apiKey: string;
                }
                | undefined;

            if (!signPayload?.success || !signData) {
                throw new Error("Invalid upload signature response");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signData.apiKey);
            formData.append("timestamp", String(signData.timestamp));
            formData.append("signature", signData.signature);
            formData.append("upload_preset", signData.uploadPreset);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
                {
                method: "POST",
                body: formData,
                }
            );

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            onChange({
                url: data.secure_url,
                publicId: data.public_id,
            });
        } catch {
            setError("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleUpload(file);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleRemove = () => {
        onChange({ url: "", publicId: "" });
    };

    return (
        <div className={className}>
            {value ? (
                <div className="relative rounded-lg overflow-hidden border border-zinc-200">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-48 object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-zinc-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        isDragging
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-300 hover:bg-zinc-50",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-2 text-sm text-zinc-500">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {isDragging ? (
                                <ImageIcon className="w-10 h-10 text-zinc-400" />
                            ) : (
                                <Upload className="w-10 h-10 text-zinc-400" />
                            )}
                            <p className="mt-2 text-sm text-zinc-500">
                                {isDragging
                                    ? "Drop image here"
                                    : "Click or drag image to upload"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">PNG, JPG, WebP up to 500KB</p>
                        </div>
                    )}
                </label>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
