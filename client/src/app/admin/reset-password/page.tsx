import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import AdminResetPasswordForm from "@/components/dashboard-auth/AdminResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Kemchuta Homes admin account.",
  path: "/admin/reset-password",
});

export default function AdminResetPasswordPage() {
  return (
    <AuthLayout
      badge="Admin"
      headline={
        <>
          Create
          <br />A New Password
        </>
      }
      description="Choose something strong and memorable. Your account security matters."
    >
      {/* useSearchParams() in the form requires a Suspense boundary */}
      <Suspense fallback={null}>
        <AdminResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
