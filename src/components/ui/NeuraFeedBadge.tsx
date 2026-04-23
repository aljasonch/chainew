import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface NeuraFeedBadgeProps {
    className?: string;
    size?: "sm" | "md";
}

/**
 * Visual indicator shown on any article imported from NeuraFeed.
 * Appears on cards, article headers, and the admin dashboard.
 */
export function NeuraFeedBadge({ className, size = "sm" }: NeuraFeedBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-semibold tracking-wide",
                "bg-cyan-500/15 text-cyan-600 border border-cyan-500/30",
                size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
                className
            )}
        >
            <Zap size={size === "sm" ? 9 : 11} className="fill-cyan-500 text-cyan-500" />
            NeuraFeed
        </span>
    );
}
