/**
 * Citation preprocessing utilities.
 *
 * remark-gfm v4 does NOT parse [^1] as footnoteReference, and
 * @mdx-js/mdx compiles <sup> as raw HTML bypassing the components map.
 * So we preprocess citation references before the markdown/MDX is parsed.
 *
 * Supports three citation formats:
 *   [^N]           — markdown footnote-style (e.g. [^1])
 *   <sup>[N]</sup> — HTML superscript style
 *   [N]            — bare bracket style (e.g. [8][15][16])
 *                    Only matched after punctuation or chained after ]
 *
 * Two functions for two different rendering engines:
 * - preprocessCitations → for compileMDX (@mdx-js/mdx)
 * - preprocessCitationsReactMarkdown → for ReactMarkdown
 */

/** Shared: replace [^N] and <sup>[N]</sup> */
function replaceExplicitCitations(
    source: string,
    toComponent: (num: number) => string
): string {
    return source
        .replace(/\[\^(\d+)\]/g, (_m, d: string) => {
            const num = Number(d);
            return Number.isFinite(num) && num >= 1 ? toComponent(num) : _m;
        })
        .replace(/<sup>\[(\d+)\]<\/sup>/g, (_m, d: string) => {
            const num = Number(d);
            return Number.isFinite(num) && num >= 1 ? toComponent(num) : _m;
        });
}

/** Shared: replace bare [N] after punctuation or after ] */
function replaceBareCitations(
    source: string,
    toComponent: (num: number) => string
): string {
    return source.replace(/(?<=[.!?,;\]])(?:\[(\d+)\])/g, (_m, d: string) => {
        const num = Number(d);
        return Number.isFinite(num) && num >= 1 ? toComponent(num) : _m;
    });
}

/**
 * For compileMDX (article page).
 * Converts citation references to <Citation n={N} /> JSX components.
 */
export function preprocessCitations(source: string): string {
    const toJsx = (num: number) => `<Citation n={${num}} />`;
    return replaceBareCitations(
        replaceExplicitCitations(source, toJsx),
        toJsx
    );
}

/**
 * For ReactMarkdown (admin editor preview).
 * Converts citation references to markdown links [[N]](#cite-N).
 * The MarkdownA component detects #cite-N and renders as Citation.
 */
export function preprocessCitationsReactMarkdown(source: string): string {
    const toLink = (num: number) => `[[${num}]](#cite-${num})`;
    return replaceBareCitations(
        replaceExplicitCitations(source, toLink),
        toLink
    );
}
