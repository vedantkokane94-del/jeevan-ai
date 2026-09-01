import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "critical" | "high" | "medium" | "low" | "neutral";
}

export function Badge({
  className = "",
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    critical: "bg-alert-600 text-white",
    high: "bg-severity-high text-white",
    medium: "bg-severity-medium text-white",
    low: "bg-severity-low text-white",
    neutral: "bg-ink-200 text-ink-900 dark:bg-ink-800 dark:text-ink-50",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-display transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
