export type BankAccount = {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  note?: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
};

export type BankAccountFormInput = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  note: string;
};
