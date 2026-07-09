"use client";

import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const baseInputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-customPurple-500";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, ...props }, ref) => {
    if (!Icon) {
      return <input ref={ref} className={cn(baseInputClass, className)} {...props} />;
    }
    return (
      <div className="relative">
        <Icon size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input ref={ref} className={cn(baseInputClass, "pr-3 pl-9", className)} {...props} />
      </div>
    );
  },
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-customPurple-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-customPurple-500",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
