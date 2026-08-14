"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { FormField, textInputClass, SubmitButton } from "./FormField";

export default function ClientLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: 'include' is what makes the browser store the
        // httpOnly cookies the API sets in its Set-Cookie response headers
        // (PRD FR-4 Phase 5 cookie auth) — without it, the cookies are
        // simply discarded.
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed.");
      // Briefly confirm success before navigating — an instant redirect with
      // zero feedback left users unsure whether their click even registered.
      setSuccess(true);
      setTimeout(() => {
        router.push("/client/portal");
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">Welcome back!</h3>
        <p className="text-sm text-gray-500">Login successful — redirecting to your portal…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-500">Sign in to access your client portal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email address">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className={textInputClass()}
          />
        </FormField>

        <FormField label="Password">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              className={`${textInputClass()} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-customPurple-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link href="/client/forgot-password" className="text-sm font-medium text-customPurple-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <SubmitButton loading={loading}>Sign In</SubmitButton>

        <p className="text-center text-sm text-gray-500">
          Don&rsquo;t have an account?{" "}
          <Link href="/client/register" className="font-semibold text-customPurple-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
