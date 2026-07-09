import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import AdminLoginForm from "@/components/dashboard-auth/AdminLoginForm";

export const metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the Kemchuta Homes admin dashboard.",
  path: "/admin/login",
});

export default function AdminLoginPage() {
  return (
    <AuthLayout
      headline={
        <>
          Run The
          <br />
          Back Office
        </>
      }
      description="Manage estates, subscriptions, inspections, the realtor network, and every payment in one place."
    >
      <AdminLoginForm />
    </AuthLayout>
  );
}
