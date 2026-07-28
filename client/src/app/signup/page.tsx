import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import AuthLayout from "@/components/client-auth/AuthLayout";
import RealtorSignupForm from "@/components/dashboard-auth/RealtorSignupForm";

export const metadata = buildMetadata({
  title: "Join as a Realtor",
  description: "Create a Kemchuta Homes realtor account and start earning commissions on referrals.",
  path: "/signup",
});

export default function RealtorSignupPage() {
  return (
    <AuthLayout
      badge="Realtor Network"
      headline={
        <>
          Build Your Real Estate
          <br />
          Empire With Us
        </>
      }
      description="Join a growing referral network with a competitive commission structure and reliable payouts."
    >
      {/* useSearchParams() in the form (reads ?ref=) requires a Suspense boundary */}
      <Suspense fallback={null}>
        <RealtorSignupForm />
      </Suspense>
    </AuthLayout>
  );
}
