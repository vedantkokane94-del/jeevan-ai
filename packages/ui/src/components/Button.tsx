import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "sos";
  size?: "sm" | "md" | "lg" | "sos";
}

/**
 * Accessible Button component per SRS §8.3.
 * Includes min touch targets and explicit focus management.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    // Basic class mapping for the prototype; would use Tailwind classes mapped to variants
    const baseClasses =
      "inline-flex items-center justify-center font-display font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600",
      secondary:
        "bg-paper-200 text-ink-900 hover:bg-paper-300 focus-visible:outline-paper-400 dark:bg-ink-700 dark:text-ink-50 dark:hover:bg-ink-600",
      destructive:
        "bg-alert-600 text-white hover:bg-alert-700 focus-visible:outline-alert-600",
      sos: "bg-alert-600 text-white hover:bg-alert-700 focus-visible:outline-alert-600 rounded-full",
    };

    // SRS §8.3 touch targets: min 44x44px for standard, 88x88px for SOS
    const sizeClasses = {
      sm: "h-9 px-3 text-sm rounded-sm",
      md: "h-11 px-4 py-2 text-base rounded-md min-h-[var(--size-touch-min)]",
      lg: "h-14 px-8 text-lg rounded-lg min-h-[var(--size-touch-min)]",
      sos: "w-[var(--size-touch-sos)] h-[var(--size-touch-sos)] text-xl font-bold rounded-full",
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
