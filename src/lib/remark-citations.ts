/**
 * Citation preprocessing utilities.
 *
 * remark-gfm v4 does NOT parse [^1] as footnoteReference, and
 * @mdx-js/mdx compiles <sup> as raw HTML bypassing the components map.
 * So we preprocess citation references before the markdown/MDX is parsed.
 *
 * Two functions for two different rendering engines:
 * - preprocessCitationsForMdx → for compileMDX (@mdx-js/mdx)
 * - preprocessCitationsForReactMarkdown → for ReactMarkdown
 */

/**
 * For compileMDX (article page).
 * Converts citation references to <Citation n={N} /> JSX components
 * that resolve through the MDX components map.
 */
export function preprocessCitations(source: string): string {
    return source
        .replace(/\[\^(\d+)\]/g, (_match, digits: string) => {
            const num = Number(digits);
            if (!Number.isFinite(num) || num < 1) return _match;
            return `<Citation n={${num}} />`;
        })
        .replace(/<sup>\[(\d+)\]<\/sup>/g, (_match, digits: string) => {
            const num = Number(digits);
            if (!Number.isFinite(num) || num < 1) return _match;
            return `<Citation n={${num}} />`;
        });
}

/**
 * For ReactMarkdown (admin editor preview).
 * Converts citation references to markdown links [[N]](#cite-N)
 * that ReactMarkdown parses natively as <a> elements.
 * The custom MarkdownA component detects #cite-N and renders as Citation.
 */
export function preprocessCitationsReactMarkdown(source: string): string {
    return source
        .replace(/\[\^(\d+)\]/g, (_match, digits: string) => {
            const num = Number(digits);
            if (!Number.isFinite(num) || num < 1) return _match;
            return `[[${num}]](#cite-${num})`;
        })
        .replace(/<sup>\[(\d+)\]<\/sup>/g, (_match, digits: string) => {
            const num = Number(digits);
            if (!Number.isFinite(num) || num < 1) return _match;
            return `[[${num}]](#cite-${num})`;
        });
}
