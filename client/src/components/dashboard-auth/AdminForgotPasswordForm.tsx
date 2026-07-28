"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FormField, textInputClass, SubmitButton } from "@/components/client-auth/FormField";

export default function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-customPurple-200 bg-customPurple-50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-customPurple-500">
          <Mail className="text-white" size={26} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">Check your inbox</h3>
        <p className="text-sm text-gray-500">
          If <span className="font-medium text-customPurple-600">{email}</span> is registered, you&rsquo;ll
          receive a reset link shortly. Check your spam folder too.
        </p>
        <Link
          href="/admin/login"
          className="mt-5 inline-block text-sm font-medium text-customPurple-600 hover:underline"
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Reset password</h2>
        <p className="mt-2 text-sm text-gray-500">Enter the email linked to your admin account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email address">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className={textInputClass()}
          />
        </FormField>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <SubmitButton loading={loading}>Send Reset Link</SubmitButton>

        <p className="text-center text-sm">
          <Link href="/admin/login" className="font-medium text-customPurple-600 hover:underline">
            ← Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
