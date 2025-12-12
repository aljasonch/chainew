import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Components } from "react-markdown";

function cx(...classes: Array<string | undefined | false | null>) {
    return classes.filter(Boolean).join(" ");
}

export function MarkdownTable(props: ComponentPropsWithoutRef<"table">) {
    const { className, ...rest } = props;
    return (
        <div className="my-4 overflow-x-auto">
            <table
                {...rest}
                className={cx(
                    "w-full border-collapse text-sm",
                    "border border-zinc-200",
                    className
                )}
            />
        </div>
    );
}

export function MarkdownThead(props: ComponentPropsWithoutRef<"thead">) {
    const { className, ...rest } = props;
    return <thead {...rest} className={cx("bg-zinc-50", className)} />;
}

export function MarkdownTr(props: ComponentPropsWithoutRef<"tr">) {
    const { className, ...rest } = props;
    return <tr {...rest} className={cx("border-b border-zinc-200", className)} />;
}

export function MarkdownTh(props: ComponentPropsWithoutRef<"th">) {
    const { className, ...rest } = props;
    return (
        <th
            {...rest}
            className={cx(
                "px-3 py-2 text-left font-semibold text-zinc-900",
                "border-r border-zinc-200 last:border-r-0",
                className
            )}
        />
    );
}

export function MarkdownTd(props: ComponentPropsWithoutRef<"td">) {
    const { className, ...rest } = props;
    return (
        <td
            {...rest}
            className={cx(
                "px-3 py-2 align-top text-zinc-700",
                "border-r border-zinc-200 last:border-r-0",
                className
            )}
        />
    );
}

export function MarkdownA(props: ComponentPropsWithoutRef<"a">) {
    const { className, ...rest } = props;
    return <a {...rest} className={cx("text-blue-600 underline", className)} />;
}

export function MarkdownImg(props: ComponentPropsWithoutRef<"img">) {
    const { className, alt, ...rest } = props;
    return (
        <img
            {...rest}
            alt={alt ?? ""}
            className={cx("max-w-full rounded-lg my-4", className)}
        />
    );
}

export function MarkdownBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
    const { className, ...rest } = props;
    return (
        <blockquote
            {...rest}
            className={cx(
                "border-l-4 border-zinc-300 pl-4 italic my-4 text-zinc-700",
                className
            )}
        />
    );
}

export function MarkdownPre(props: ComponentPropsWithoutRef<"pre">) {
    const { className, ...rest } = props;
    return (
        <pre
            {...rest}
            className={cx(
                "bg-zinc-100 p-4 rounded-lg overflow-x-auto my-4",
                className
            )}
        />
    );
}

export function MarkdownInlineCode({ children }: { children: ReactNode }) {
    return <code className="bg-zinc-100 px-1 rounded">{children}</code>;
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
    const { className, ...rest } = props;
    return <h1 {...rest} className={cx("text-2xl font-bold mt-6 mb-4", className)} />;
}

export function MarkdownH2(props: ComponentPropsWithoutRef<"h2">) {
    const { className, ...rest } = props;
    return <h2 {...rest} className={cx("text-xl font-semibold mt-6 mb-3", className)} />;
}

export function MarkdownH3(props: ComponentPropsWithoutRef<"h3">) {
    const { className, ...rest } = props;
    return <h3 {...rest} className={cx("text-lg font-semibold mt-4 mb-2", className)} />;
}

export function MarkdownP(props: ComponentPropsWithoutRef<"p">) {
    const { className, ...rest } = props;
    return <p {...rest} className={cx("my-4", className)} />;
}

export function MarkdownUl(props: ComponentPropsWithoutRef<"ul">) {
    const { className, ...rest } = props;
    return <ul {...rest} className={cx("my-4 list-disc pl-6", className)} />;
}

export function MarkdownOl(props: ComponentPropsWithoutRef<"ol">) {
    const { className, ...rest } = props;
    return <ol {...rest} className={cx("my-4 list-decimal pl-6", className)} />;
}

export function MarkdownLi(props: ComponentPropsWithoutRef<"li">) {
    const { className, ...rest } = props;
    return <li {...rest} className={cx("my-1", className)} />;
}

export const mdxComponents = {
    h1: MarkdownH1,
    h2: MarkdownH2,
    h3: MarkdownH3,
    p: MarkdownP,
    a: MarkdownA,
    img: MarkdownImg,
    Callout: MarkdownCallout,
    blockquote: MarkdownBlockquote,
    pre: MarkdownPre,
    code: (props: ComponentPropsWithoutRef<"code">) => (
        <code {...props} className={cx("text-sm", props.className)} />
    ),
    ul: MarkdownUl,
    ol: MarkdownOl,
    li: MarkdownLi,
    table: MarkdownTable,
    thead: MarkdownThead,
    tr: MarkdownTr,
    th: MarkdownTh,
    td: MarkdownTd,
};

export const reactMarkdownComponents: Components = {
    h1: MarkdownH1,
    h2: MarkdownH2,
    h3: MarkdownH3,
    p: MarkdownP,
    a: MarkdownA,
    img: MarkdownImg,
    Callout: MarkdownCallout,
    blockquote: MarkdownBlockquote,
    pre: MarkdownPre,
    code: ({ children, className, ...props }) => {
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
