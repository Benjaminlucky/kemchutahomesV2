export type Inspection = {
  _id: string;
  estateName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inspectionDate: string;
  persons: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
};
