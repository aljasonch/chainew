import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

/**
 * Remark plugin that transforms markdown footnote references [^N]
 * into inline Citation components for MDX rendering.
 *
 * Only transforms references where the identifier is a pure number
 * (e.g. [^1], [^2]). Named footnotes like [^note] are left untouched.
 */
export const remarkCitations: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, "footnoteReference", (node, index, parent) => {
            if (!parent || index === undefined) return;

            const num = Number(node.identifier);
            if (!Number.isFinite(num) || num < 1) return;

            // Replace the footnoteReference node with an mdxJsxTextElement
            // that renders <Citation n={num} />
            parent.children[index] = {
                type: "mdxJsxTextElement",
                name: "Citation",
                attributes: [
                    {
                        type: "mdxJsxAttribute",
                        name: "n",
                        value: num,
                    },
                ],
                children: [],
            } as never;
        });
    };
};
