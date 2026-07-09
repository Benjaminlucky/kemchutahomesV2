import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import ClientForgotPasswordForm from "@/components/client-auth/ClientForgotPasswordForm";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Kemchuta Homes client portal password.",
  path: "/client/forgot-password",
});

export default function ClientForgotPasswordPage() {
  return (
    <AuthLayout
      headline={
        <>
          Forgot
          <br />
          Your Password?
        </>
      }
      description="No worries — it happens to the best of us. Enter your email and we'll send you a secure reset link."
    >
      <ClientForgotPasswordForm />
    </AuthLayout>
  );
}
