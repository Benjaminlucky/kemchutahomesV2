"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Compact admin/dashboard button — distinct from client-auth's full-width
// gradient SubmitButton, which is a marketing-style CTA for auth pages.
const VARIANTS = {
  primary: "bg-customPurple-500 text-white hover:bg-customPurple-700",
  secondary:
    "border border-gray-300 bg-white text-customBlack-700 hover:bg-customBlack-50",
  danger: "text-red-500 hover:bg-red-50",
  dangerSolid: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-customPurple-600 hover:bg-customPurple-50",
} as const;

const SIZES = {
  sm: "gap-1.5 rounded-lg px-3 py-2 text-xs",
  md: "gap-2 rounded-full px-5 py-2.5 text-sm",
  icon: "rounded-lg p-2",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

// Exposed so non-<button> elements (e.g. a Next <Link> styled as a button)
// can share the same visual classes without duplicating the strings above.
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = "Button";
