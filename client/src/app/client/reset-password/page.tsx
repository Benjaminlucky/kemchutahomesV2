import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import ClientResetPasswordForm from "@/components/client-auth/ClientResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Kemchuta Homes client portal account.",
  path: "/client/reset-password",
});

export default function ClientResetPasswordPage() {
  return (
    <AuthLayout
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
        <ClientResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
