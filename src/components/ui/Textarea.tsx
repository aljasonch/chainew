import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {label}
                    </label>
                )}
                <textarea
                    className={cn(
                        "flex min-h-[120px] w-full rounded-md border border-default bg-card px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                        error && "border-error focus:ring-error",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-error">{error}</p>}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
