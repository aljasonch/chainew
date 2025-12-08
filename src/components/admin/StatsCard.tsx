import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                "bg-white border border-zinc-200 rounded-lg p-6",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
                    {description && (
                        <p className="mt-1 text-sm text-zinc-400">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                "mt-1 text-sm font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? "+" : "-"}
                            {Math.abs(trend.value)}% from last month
                        </p>
                    )}
                </div>
                <div className="p-3 bg-zinc-100 rounded-lg">
                    <Icon className="w-6 h-6 text-zinc-600" />
                </div>
            </div>
        </div>
    );
}
