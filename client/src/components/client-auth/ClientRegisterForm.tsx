"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { FormField, textInputClass, SubmitButton } from "./FormField";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword" | "general", string>>;

export default function ClientRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "Must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // stores the httpOnly cookies the API sets on successful signup
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      // Briefly confirm success before navigating — an instant redirect with
      // zero feedback left users unsure whether their click even registered.
      setSuccess(true);
      setTimeout(() => {
        router.push("/client/portal");
        router.refresh();
      }, 900);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Registration failed." });
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
        <h3 className="mb-2 text-xl font-bold text-gray-800">Account created!</h3>
        <p className="text-sm text-gray-500">Welcome to Kemchuta Homes — redirecting to your portal…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Create your account</h2>
        <p className="mt-2 text-sm text-gray-500">
          Already registered?{" "}
          <Link href="/client/login" className="font-semibold text-customPurple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" error={errors.firstName}>
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="John"
              className={textInputClass(errors.firstName)}
            />
          </FormField>
          <FormField label="Last name" error={errors.lastName}>
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Doe"
              className={textInputClass(errors.lastName)}
            />
          </FormField>
        </div>

        <FormField label="Email address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className={textInputClass(errors.email)}
          />
        </FormField>

        <FormField label="Phone number (optional)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="08012345678"
            className={textInputClass()}
          />
        </FormField>

        <FormField label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 characters"
              className={`${textInputClass(errors.password)} pr-10`}
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

        <FormField label="Confirm password" error={errors.confirmPassword}>
          <input
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="Repeat your password"
            className={textInputClass(errors.confirmPassword)}
          />
        </FormField>

        {errors.general && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {errors.general}
          </p>
        )}

        <SubmitButton loading={loading}>Create Account</SubmitButton>
      </form>
    </div>
  );
}
