import { cn } from "@/lib/utils";

export function ErrorBanner({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600", className)}>
      {children}
    </p>
  );
}
