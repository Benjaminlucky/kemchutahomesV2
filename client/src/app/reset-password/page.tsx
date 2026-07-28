import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import RealtorResetPasswordForm from "@/components/dashboard-auth/RealtorResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Kemchuta Homes realtor account.",
  path: "/reset-password",
});

export default function RealtorResetPasswordPage() {
  return (
    <AuthLayout
      badge="Realtor Network"
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
        <RealtorResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
