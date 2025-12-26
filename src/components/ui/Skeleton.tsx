import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={cn("skeleton rounded", className)} style={style} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-4"
                    style={{ width: i === lines - 1 ? "60%" : "100%" }}
                />
            ))}
        </div>
    );
}

export function ArticleCardSkeleton() {
    return (
        <div
            className="rounded-lg overflow-hidden animate-pulse card"
        >
            <Skeleton className="h-48 rounded-none" />
            <div className="p-4 space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-full" />
                <SkeletonText lines={2} />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
}

export function FeaturedArticleSkeleton() {
    return (
        <div
            className="md:flex rounded-lg overflow-hidden animate-pulse card"
        >
            <Skeleton className="md:w-1/2 h-48 md:h-64 rounded-none" />
            <div className="md:w-1/2 p-6 space-y-4">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-8 w-full" />
                <SkeletonText lines={3} />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="animate-pulse border-b border-default">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function StatsCardSkeleton() {
    return (
        <div
            className="rounded-lg p-6 animate-pulse card"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
        </div>
    );
}

export function PageLoadingSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>

            <FeaturedArticleSkeleton />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ArticleCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
