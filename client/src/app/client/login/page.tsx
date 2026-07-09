import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import ClientLoginForm from "@/components/client-auth/ClientLoginForm";

export const metadata = buildMetadata({
  title: "Client Login",
  description: "Sign in to your Kemchuta Homes client portal.",
  path: "/client/login",
});

export default function ClientLoginPage() {
  return (
    <AuthLayout
      headline={
        <>
          Your Land Journey,
          <br />
          At a Glance
        </>
      }
      description="Track your subscription status, view documents, and monitor your inspection schedule — all from one secure portal."
    >
      <ClientLoginForm />
    </AuthLayout>
  );
}
