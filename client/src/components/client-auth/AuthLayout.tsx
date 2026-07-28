import Link from "next/link";
import { Home } from "lucide-react";

// Shared two-panel shell for the four client-auth pages (login, register,
// forgot/reset password) — kept as a plain Server Component (no "use
// client") since it's static markup; only the forms inside `children` need
// interactivity.
export default function AuthLayout({
  headline,
  description,
  children,
  badge = "Client Portal",
}: {
  headline: React.ReactNode;
  description: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f2fa] md:flex-row">
      <div
        className="relative flex flex-col justify-between overflow-hidden px-8 py-12 md:w-2/5 md:px-12 md:py-16"
        style={{
          background: "linear-gradient(145deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)",
        }}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-48 w-48 rounded-full bg-white/5" />

        <Link
          href="/"
          className="relative z-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
        >
          <Home size={16} />
          Back to homepage
        </Link>

        <div className="relative z-10 mt-auto">
          <div className="mb-6 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-white/90 uppercase">
            {badge}
          </div>
          <h1 className="mb-4 text-4xl leading-tight font-black text-white md:text-5xl">
            {headline}
          </h1>
          <p className="max-w-md text-sm text-white/65 md:text-base">{description}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
