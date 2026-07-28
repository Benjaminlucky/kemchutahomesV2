import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import AdminForgotPasswordForm from "@/components/dashboard-auth/AdminForgotPasswordForm";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Kemchuta Homes admin account password.",
  path: "/admin/forgot-password",
});

export default function AdminForgotPasswordPage() {
  return (
    <AuthLayout
      badge="Admin"
      headline={
        <>
          Forgot
          <br />
          Your Password?
        </>
      }
      description="No worries — it happens to the best of us. Enter your email and we'll send you a secure reset link."
    >
      <AdminForgotPasswordForm />
    </AuthLayout>
  );
}
