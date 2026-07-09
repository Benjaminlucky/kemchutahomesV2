import { buildMetadata } from "@/lib/seo";
import CompanyIntro from "@/components/company/companyIntro/CompanyIntro";
import CompanyVision from "@/components/company/companyVision/CompanyVision";
import CompanyMission from "@/components/company/companyMission/CompanyMission";
import CompanyValues from "@/components/company/companyValues/CompanyValues";
import CompanyPeople from "@/components/company/companyPeople/CompanyPeople";
import Journey from "@/components/company/journey/Journey";

export const metadata = buildMetadata({
  title: "Our Company",
  description:
    "Founded in 2018, Kemchuta Homes Limited has grown from a modest local firm into a leading Nigerian real estate company — our story, vision, mission, values, and the team behind it.",
  path: "/company",
});

export default function Company() {
  return (
    <>
      <CompanyIntro />
      <CompanyVision />
      <CompanyMission />
      <CompanyValues />
      <CompanyPeople />
      <Journey />
    </>
  );
}
