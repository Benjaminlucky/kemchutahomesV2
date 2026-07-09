"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  redirectTo = "/client/login",
  variant = "light",
}: {
  redirectTo?: string;
  /** "light" for use on white backgrounds (client portal); "dark" for use on the purple dashboard sidebar. */
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push(redirectTo);
      router.refresh();
    }
  };

  const isDark = variant === "dark";

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
        isDark ? "w-full border-white/25 text-white hover:bg-white/10" : "text-customPurple-600"
      }`}
      style={isDark ? undefined : { borderColor: "rgba(112,12,235,0.35)" }}
    >
      <LogOut size={15} />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
