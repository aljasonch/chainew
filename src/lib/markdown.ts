const markdownBulletMarker = /^[ \t]*[•‣◦]\s+/gm;

export function normalizeMarkdownListMarkers(source: string): string {
    return source.replace(markdownBulletMarker, (match) =>
        match.replace(/[•‣◦]/, "-")
    );
}
