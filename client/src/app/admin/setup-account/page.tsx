import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import AdminSetupAccountForm from "@/components/dashboard-auth/AdminSetupAccountForm";

export const metadata = buildMetadata({
  title: "Set Up Your Account",
  description: "Activate your Kemchuta Homes admin account.",
  path: "/admin/setup-account",
});

export default function AdminSetupAccountPage() {
  return (
    <AuthLayout
      badge="Admin"
      headline={
        <>
          Welcome —
          <br />
          Set Up Your Account
        </>
      }
      description="Choose a password to activate your admin account and get started."
    >
      {/* useSearchParams() in the form requires a Suspense boundary */}
      <Suspense fallback={null}>
        <AdminSetupAccountForm />
      </Suspense>
    </AuthLayout>
  );
}
