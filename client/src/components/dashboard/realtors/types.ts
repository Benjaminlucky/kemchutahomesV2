export type Realtor = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  state?: string;
  bank?: string;
  accountName?: string;
  accountNumber?: string;
  referralCode: string;
  avatar?: string;
  birthDate?: string;
  recruitedByName?: string | null;
  createdAt: string;
};

export type RealtorListResponse = {
  docs: Realtor[];
  total: number;
  page: number;
  pages: number;
};

export type RealtorUpdateInput = Pick<
  Realtor,
  "firstName" | "lastName" | "email" | "phone" | "state" | "bank" | "accountName" | "accountNumber"
>;
