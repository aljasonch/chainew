import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    index?: number;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    index = 0,
}: StatsCardProps) {
    const staggerClass = index < 10 ? `stagger-${index + 1}` : "";

    return (
        <div
            className={cn(
                "rounded-lg p-6",
                "hover-lift transition-all duration-200",
                "animate-fadeInUp animate-on-load",
                staggerClass
            )}
            style={{
                animationFillMode: "forwards",
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)'
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-secondary">{title}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{value}</p>
                    {description && (
                        <p className="text-sm text-accent mt-1">{description}</p>
                    )}
                    {trend && (
                        <div
                            className="flex items-center gap-1 mt-2 text-sm"
                            style={{ color: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)' }}
                        >
                            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
                            <span className="text-secondary">vs last month</span>
                        </div>
                    )}
                </div>
                <div
                    className="p-3 rounded-lg transition-transform duration-200 hover:scale-110"
                    style={{ background: 'var(--color-accent)' }}
                >
                    <Icon className="w-6 h-6 text-inverse" />
                </div>
            </div>
        </div>
    );
}
