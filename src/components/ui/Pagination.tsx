import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null;

    const buildPageUrl = (page: number) => `${basePath}?page=${page}`;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (showEllipsisStart) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (showEllipsisEnd) {
                pages.push("...");
            }

            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
            {currentPage > 1 ? (
                <Link
                    href={buildPageUrl(currentPage - 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-card border border-default text-primary hover:bg-muted transition-colors"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft size={16} />
                    Previous
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-muted border border-default text-secondary cursor-not-allowed opacity-50">
                    <ChevronLeft size={16} />
                    Previous
                </span>
            )}

            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-sm text-secondary"
                        >
                            ...
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={buildPageUrl(page as number)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === page
                                    ? "bg-primary text-inverse"
                                    : "bg-card border border-default text-primary hover:bg-muted"
                            }`}
                            aria-label={`Go to page ${page}`}
                            {...(currentPage === page ? { 'aria-current': 'page' as const } : {})}
                        >
                            {page}
                        </Link>
                    )
                )}
            </div>

            {currentPage < totalPages ? (
                <Link
                    href={buildPageUrl(currentPage + 1)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-card border border-default text-primary hover:bg-muted transition-colors"
                    aria-label="Go to next page"
                >
                    Next
                    <ChevronRight size={16} />
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-muted border border-default text-secondary cursor-not-allowed opacity-50">
                    Next
                    <ChevronRight size={16} />
                </span>
            )}
        </nav>
    );
}
