import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import RealtorLoginForm from "@/components/dashboard-auth/RealtorLoginForm";

export const metadata = buildMetadata({
  title: "Realtor Login",
  description: "Sign in to your Kemchuta Homes realtor dashboard.",
  path: "/login",
});

export default function RealtorLoginPage() {
  return (
    <AuthLayout
      headline={
        <>
          Grow Your
          <br />
          Referral Network
        </>
      }
      description="Track your recruits, monitor commissions, and manage every referral from one dashboard."
    >
      <RealtorLoginForm />
    </AuthLayout>
  );
}
