/**
 * Preprocesses markdown/MDX content to convert [^N] citation references
 * into <sup>[N]</sup> HTML inline elements.
 *
 * remark-gfm v4 does NOT parse [^1] as footnoteReference — it stays as
 * plain text. Rather than fighting the AST, we do a simple string
 * replacement before the markdown is parsed. The <sup>[N]</sup> HTML is
 * then handled by the existing MarkdownSup component which detects the
 * [N] pattern and renders a linked Citation.
 *
 * Only transforms patterns where N is a positive integer.
 * Named references like [^note] are left untouched.
 */
export function preprocessCitations(source: string): string {
    return source.replace(/\[\^(\d+)\]/g, (_match, digits: string) => {
        const num = Number(digits);
        if (!Number.isFinite(num) || num < 1) return _match;
        return `<sup>[${num}]</sup>`;
    });
}
