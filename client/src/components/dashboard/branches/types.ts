export type BranchHours = { weekdays: string; saturday: string; sunday: string };

export type BranchSocial = {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  whatsapp?: string;
  youtube?: string;
};

export type Branch = {
  branchId: string;
  label: string;
  isHQ: boolean;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  phones: string[];
  emails: string[];
  hours: BranchHours;
  social: BranchSocial;
  isActive: boolean;
};

export type BranchFormInput = {
  label: string;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  phones: string[];
  emails: string[];
  hours: BranchHours;
  social: BranchSocial;
};

export const EMPTY_BRANCH_FORM: BranchFormInput = {
  label: "",
  address: "",
  mapEmbedUrl: "",
  mapLink: "",
  phones: [],
  emails: [],
  hours: { weekdays: "", saturday: "", sunday: "" },
  social: { instagram: "", facebook: "", twitter: "", whatsapp: "", youtube: "" },
};
