import type { ComponentPropsWithoutRef } from "react";

/**
 * Inline citation superscript that links to the matching source entry.
 *
 * Usage in MDX:
 *   - Markdown syntax: Some fact.[^1]
 *   - HTML syntax:     Some fact.<sup>[1]</sup>
 *
 * Both render as a clickable [1] that scrolls to #src-1 in the sources list.
 */
export function Citation({ n, ...rest }: { n: number | string } & ComponentPropsWithoutRef<"sup">) {
    const num = typeof n === "string" ? Number(n) : n;
    return (
        <sup className="citation" {...rest}>
            <a href={`#src-${num}`}>[{num}]</a>
        </sup>
    );
}
