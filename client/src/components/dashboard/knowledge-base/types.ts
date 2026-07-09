export const FAQ_CATEGORIES = [
  "General",
  "Subscription",
  "Buy2Sell",
  "Inspection",
  "Documents",
  "Payment",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type Faq = {
  _id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  active?: boolean;
};

export type Notice = { _id: string; text: string; active?: boolean };

export type CompanyInfo = {
  lagosPhone: string;
  asabaPhone: string;
  whatsappNumber: string;
  email: string;
  lagosAddress: string;
  asabaAddress: string;
  workingHours: string;
  instagramHandle: string;
};

export type KnowledgeBase = {
  faqs: Faq[];
  companyInfo: CompanyInfo;
  notices: Notice[];
};
