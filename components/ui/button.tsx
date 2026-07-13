import * as React from "react";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "premium";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white shadow-glow hover:shadow-glow",
  secondary: "bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-border-hover",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/50",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-glow",
  premium: "bg-gradient-brand text-white shadow-glow bg-gradient-brand-hover",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", isLoading, variant = "primary", size = "md", leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-lg hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
