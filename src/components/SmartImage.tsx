"use client";

import { useState } from "react";

interface SmartImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    eager?: boolean;
}

/**
 * Image that always fills its frame and never shows a gray placeholder.
 * Renders nothing when there is no URL or the remote file fails to load
 * (hotlink-blocked feed images), so cards simply become text-only.
 */
export function SmartImage({ src, alt, className = "", eager = false }: SmartImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            loading={eager ? undefined : "lazy"}
            draggable={false}
            className={`block h-full w-full object-cover ${className}`}
        />
    );
}
