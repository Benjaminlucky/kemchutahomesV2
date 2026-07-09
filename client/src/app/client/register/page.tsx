import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import ClientRegisterForm from "@/components/client-auth/ClientRegisterForm";

export const metadata = buildMetadata({
  title: "Create Client Account",
  description: "Register for a Kemchuta Homes client portal account.",
  path: "/client/register",
});

export default function ClientRegisterPage() {
  return (
    <AuthLayout
      headline={
        <>
          Your Property Journey,
          <br />
          All in One Place
        </>
      }
      description="Track subscriptions, download documents, and monitor your inspections — from a secure personal dashboard."
    >
      <ClientRegisterForm />
    </AuthLayout>
  );
}
