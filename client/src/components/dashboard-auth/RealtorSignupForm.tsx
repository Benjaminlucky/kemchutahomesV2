"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FormField, textInputClass, SubmitButton } from "@/components/client-auth/FormField";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

const BANKS = [
  "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank", "FCMB",
  "GTBank", "Heritage Bank", "Keystone Bank", "MoniePoint", "Opay Digital",
  "Polaris Bank", "Stanbic IBTC", "Sterling Bank", "Union Bank", "UBA", "Unity Bank",
  "Wema Bank", "Zenith Bank",
];

type Errors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "birthDate"
    | "state"
    | "bank"
    | "accountName"
    | "accountNumber"
    | "password"
    | "confirmPassword"
    | "general",
    string
  >
>;

export default function RealtorSignupForm() {
  const router = useRouter();
  const ref = useSearchParams().get("ref");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    state: "",
    bank: "",
    accountName: "",
    accountNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number";
    if (!form.birthDate) e.birthDate = "Date of birth is required";
    if (!form.state) e.state = "Select your state";
    if (!form.bank) e.bank = "Select your bank";
    if (!form.accountName.trim()) e.accountName = "Account name is required";
    if (!/^\d{10}$/.test(form.accountNumber)) e.accountNumber = "Must be 10 digits";
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtors/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          birthDate: form.birthDate,
          state: form.state,
          bank: form.bank,
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
          password: form.password,
          ...(ref ? { ref } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed.");
      router.push("/login");
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Signup failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Join the network</h2>
        <p className="mt-2 text-sm text-gray-500">
          Already a realtor?{" "}
          <Link href="/login" className="font-semibold text-customPurple-600 hover:underline">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Phone number" error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="08012345678"
              className={textInputClass(errors.phone)}
            />
          </FormField>
          <FormField label="Date of birth" error={errors.birthDate}>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              className={textInputClass(errors.birthDate)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="State" error={errors.state}>
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className={textInputClass(errors.state)}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Bank" error={errors.bank}>
            <select
              value={form.bank}
              onChange={(e) => set("bank", e.target.value)}
              className={textInputClass(errors.bank)}
            >
              <option value="">Select bank</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Account name" error={errors.accountName}>
          <input
            value={form.accountName}
            onChange={(e) => set("accountName", e.target.value)}
            placeholder="As it appears on your bank account"
            className={textInputClass(errors.accountName)}
          />
        </FormField>

        <FormField label="Account number" error={errors.accountNumber}>
          <input
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)}
            placeholder="10-digit account number"
            inputMode="numeric"
            className={textInputClass(errors.accountNumber)}
          />
        </FormField>
        <p className="-mt-3 text-xs text-gray-400">
          Used only for commission payouts, stored securely.
        </p>

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

        {ref && (
          <p className="text-center text-xs text-gray-400">Referral code {ref} will be applied automatically.</p>
        )}
      </form>
    </div>
  );
}
