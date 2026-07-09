import { cn } from "@/lib/utils";

export function Card({
  className,
  radius = "2xl",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { radius?: "2xl" | "3xl" }) {
  return (
    <div
      className={cn(
        "border border-customBlack-100 bg-white",
        radius === "3xl" ? "rounded-3xl" : "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}
