export type NavLink = {
  name: string;
  link: string;
};

export const mainLink: NavLink[] = [
  { name: "Home", link: "/" },
  { name: "Our Company", link: "/company" },
  { name: "Developments", link: "/developments" },
  { name: "Contact", link: "/contact" },
];

// The refund policy lives inside the Terms page rather than on its own page,
// so it stays in one place alongside the subscription terms it depends on.
export const support: NavLink[] = [
  { name: "Contact", link: "/contact" },
  { name: "Refund Policy", link: "/terms#refunds" },
  { name: "FAQS", link: "/faq" },
  { name: "Privacy Policy", link: "/privacy" },
  { name: "Terms & Conditions", link: "/terms" },
];

export const social: NavLink[] = [
  { name: "Instagram", link: "/" },
  { name: "Facebook", link: "/" },
  { name: "Linkedin", link: "/" },
  { name: "Twitter", link: "/" },
  { name: "WhatsApp", link: "/" },
];
