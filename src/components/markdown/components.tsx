import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Components } from "react-markdown";
import { Citation } from "./Citation";

function cx(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

/**
 * react-markdown v10 passes a `node` prop (the mdast node) to every custom
 * component. It must be stripped before spreading onto DOM elements,
 * otherwise it leaks into the HTML as node="[object Object]".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripNode<T extends Record<string, any>>(props: T): Omit<T, "node"> {
    const { node: _node, ...rest } = props;
    return rest;
}

export function MarkdownTable(props: ComponentPropsWithoutRef<"table">) {
    const { className, ...rest } = stripNode(props);
    return (
        <div className="table-wrap my-6 overflow-x-auto">
            <table
                {...rest}
                className={cx(
                    "w-full border-collapse text-[15px] leading-7",
                    "border border-neutral-200",
                    className
                )}
            />
        </div>
    );
}

export function MarkdownThead(props: ComponentPropsWithoutRef<"thead">) {
    const { className, ...rest } = stripNode(props);
    return <thead {...rest} className={cx("bg-neutral-50", className)} />;
}

export function MarkdownTr(props: ComponentPropsWithoutRef<"tr">) {
    const { className, ...rest } = stripNode(props);
    return (
        <tr
            {...rest}
            className={cx(
                "border-b border-neutral-200 last:border-b-0 odd:bg-white even:bg-neutral-50/60",
                className
            )}
        />
    );
}

export function MarkdownTh(props: ComponentPropsWithoutRef<"th">) {
    const { className, ...rest } = stripNode(props);
    return (
        <th
            {...rest}
            className={cx(
                "font-display border-b-2 border-neutral-900 px-3 py-2 text-left text-sm font-bold text-neutral-900",
                className
            )}
        />
    );
}

export function MarkdownTd(props: ComponentPropsWithoutRef<"td">) {
    const { className, ...rest } = stripNode(props);
    return (
        <td
            {...rest}
            className={cx(
                "px-3 py-2 align-top text-neutral-700",
                "border-r border-neutral-200 last:border-r-0",
                className
            )}
        />
    );
}

export function MarkdownA(props: ComponentPropsWithoutRef<"a">) {
    const { className, href, children, ...rest } = stripNode(props);
    // Detect citation links from preprocessCitationsReactMarkdown
    if (typeof href === "string" && href.startsWith("#cite-")) {
        const num = Number(href.replace("#cite-", ""));
        if (Number.isFinite(num) && num >= 1) {
            return <Citation n={num} />;
        }
    }
    return <a {...rest} href={href} className={cx("text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900", className)}>{children}</a>;
}

export function MarkdownImg(props: ComponentPropsWithoutRef<"img">) {
    const { className, alt, ...rest } = stripNode(props);
    return (
        <img
            {...rest}
            alt={alt ?? ""}
            className={cx("max-w-full my-6", className)}
        />
    );
}

export function MarkdownBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
    const { className, ...rest } = stripNode(props);
    return (
        <blockquote
            {...rest}
            className={cx(
                "border-l-2 border-neutral-900 pl-4 my-6 text-neutral-700",
                className
            )}
        />
    );
}

export function MarkdownPre(props: ComponentPropsWithoutRef<"pre">) {
    const { className, ...rest } = stripNode(props);
    return (
        <pre
            {...rest}
            className={cx(
                "bg-neutral-100 p-4 overflow-x-auto my-6 text-sm",
                className
            )}
        />
    );
}

export function MarkdownInlineCode({ children }: { children: ReactNode }) {
    return <code className="bg-neutral-100 px-1">{children}</code>;
}

export function MarkdownCallout({
    children,
    type = "info",
    title,
}: {
    children: ReactNode;
    type?: "info" | "warning" | "success" | "error";
    title?: string;
}) {
    const variants: Record<string, string> = {
        info: "border-blue-200 bg-blue-50 text-blue-900",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        error: "border-red-200 bg-red-50 text-red-900",
    };

    const variantClass = variants[type] ?? variants.info;

    return (
        <div className={cx("my-4 rounded-lg border px-4 py-3", variantClass)}>
            {title && <p className="font-semibold mb-1">{title}</p>}
            <div className="text-sm">{children}</div>
        </div>
    );
}

export function MarkdownH1(props: ComponentPropsWithoutRef<"h1">) {
    const { className, ...rest } = stripNode(props);
    return <h1 {...rest} className={cx("font-display text-2xl font-bold mt-8 mb-4 text-neutral-900", className)} />;
}

export function MarkdownH2(props: ComponentPropsWithoutRef<"h2">) {
    const { className, ...rest } = stripNode(props);
    return <h2 {...rest} className={cx("font-display text-xl font-bold mt-8 mb-3 text-neutral-900", className)} />;
}

export function MarkdownH3(props: ComponentPropsWithoutRef<"h3">) {
    const { className, ...rest } = stripNode(props);
    return <h3 {...rest} className={cx("font-display text-lg font-bold mt-6 mb-2 text-neutral-900", className)} />;
}

export function MarkdownP(props: ComponentPropsWithoutRef<"p">) {
    const { className, ...rest } = stripNode(props);
    return <p {...rest} className={cx("my-4", className)} />;
}

export function MarkdownUl(props: ComponentPropsWithoutRef<"ul">) {
    const { className, ...rest } = stripNode(props);
    return <ul {...rest} className={cx("my-4 list-disc pl-6", className)} />;
}

export function MarkdownOl(props: ComponentPropsWithoutRef<"ol">) {
    const { className, ...rest } = stripNode(props);
    return <ol {...rest} className={cx("my-4 list-decimal pl-6", className)} />;
}

export function MarkdownLi(props: ComponentPropsWithoutRef<"li">) {
    const { className, ...rest } = stripNode(props);
    return <li {...rest} className={cx("my-1", className)} />;
}

/**
 * Custom <sup> handler that detects citation pattern [N] and renders
 * as a linked Citation component. Falls back to plain superscript otherwise.
 */
export function MarkdownSup({ children, ...rest }: ComponentPropsWithoutRef<"sup">) {
    const { node: _node, ...clean } = rest as Record<string, unknown>;
    const text = typeof children === "string" ? children : "";
    const match = text.match(/^\[(\d+)\]$/);
    if (match) {
        return <Citation n={Number(match[1])} {...clean} />;
    }
    return <sup {...clean}>{children}</sup>;
}

export const mdxComponents = {
    h1: MarkdownH1,
    h2: MarkdownH2,
    h3: MarkdownH3,
    p: MarkdownP,
    a: MarkdownA,
    img: MarkdownImg,
    Callout: MarkdownCallout,
    Citation,
    sup: MarkdownSup,
    blockquote: MarkdownBlockquote,
    pre: MarkdownPre,
    code: (props: ComponentPropsWithoutRef<"code">) => {
        const { node: _node, ...clean } = props as Record<string, unknown>;
        return (
            <code {...(clean as ComponentPropsWithoutRef<"code">)} className={cx("text-sm", (clean as { className?: string }).className)} />
        );
    },
    ul: MarkdownUl,
    ol: MarkdownOl,
    li: MarkdownLi,
    table: MarkdownTable,
    thead: MarkdownThead,
    tr: MarkdownTr,
    th: MarkdownTh,
    td: MarkdownTd,
};

export const reactMarkdownComponents: Components & { Callout?: typeof MarkdownCallout; Citation?: typeof Citation } = {
    h1: MarkdownH1,
    h2: MarkdownH2,
    h3: MarkdownH3,
    p: MarkdownP,
    a: MarkdownA,
    img: MarkdownImg,
    Callout: MarkdownCallout,
    Citation,
    sup: MarkdownSup,
    blockquote: MarkdownBlockquote,
    pre: MarkdownPre,
    code: ({ children, className, node: _node, ...props }) => {
        const isBlock = typeof className === "string" && className.includes("language-");
        if (!isBlock) return <MarkdownInlineCode>{children}</MarkdownInlineCode>;
        return (
            <code {...props} className={cx("text-sm", className)}>
                {children}
            </code>
        );
    },
    ul: MarkdownUl,
    ol: MarkdownOl,
    li: MarkdownLi,
    table: MarkdownTable,
    thead: MarkdownThead,
    tr: MarkdownTr,
    th: MarkdownTh,
    td: MarkdownTd,
};
