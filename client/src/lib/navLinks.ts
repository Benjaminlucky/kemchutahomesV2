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

// TODO: Refund Policy, Legal, and Terms & Conditions still point at "/" in
// the legacy app too — wire up real destinations (or drop the links) once
// those pages/policies exist.
export const support: NavLink[] = [
  { name: "Contact", link: "/contact" },
  { name: "Refund Policy", link: "/" },
  { name: "FAQS", link: "/faq" },
  { name: "Legal", link: "/" },
  { name: "Terms & Conditions", link: "/" },
];

export const social: NavLink[] = [
  { name: "Instagram", link: "/" },
  { name: "Facebook", link: "/" },
  { name: "Linkedin", link: "/" },
  { name: "Twitter", link: "/" },
  { name: "WhatsApp", link: "/" },
];
