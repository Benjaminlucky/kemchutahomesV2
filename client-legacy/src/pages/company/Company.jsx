import React from "react";
import CompanyIntro from "../../components/company/companyIntro/CompanyIntro";
import CompanyVision from "../../components/company/companyVision/CompanyVision";
import CompanyMission from "../../components/company/companyMission/CompanyMission";
import CompanyValues from "../../components/company/companyValues/CompanyValues";
import CompanyPeople from "../../components/company/companyPeople/CompanyPeople";
import Journey from "../../components/company/journey/Journey";

const Company = () => {
  return (
    <main className="mt-24">
      <CompanyIntro />
      <CompanyVision />
      <CompanyMission />
      <CompanyValues />
      <CompanyPeople />
      <Journey />
    </main>
  );
};

export default Company;
