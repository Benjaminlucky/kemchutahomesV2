import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import RealtorForgotPasswordForm from "@/components/dashboard-auth/RealtorForgotPasswordForm";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Kemchuta Homes realtor account password.",
  path: "/forgot-password",
});

export default function RealtorForgotPasswordPage() {
  return (
    <AuthLayout
      badge="Realtor Network"
      headline={
        <>
          Forgot
          <br />
          Your Password?
        </>
      }
      description="No worries — it happens to the best of us. Enter your email and we'll send you a secure reset link."
    >
      <RealtorForgotPasswordForm />
    </AuthLayout>
  );
}
