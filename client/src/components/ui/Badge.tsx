import { cn } from "@/lib/utils";

// Exported so other tone-driven controls (e.g. a <select> standing in for a
// badge) can share the same color pairs instead of redefining them.
export const TONES = {
  purple: "bg-customPurple-100 text-customPurple-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-500",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  tone = "gray",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", TONES[tone], className)}>
      {children}
    </span>
  );
}
