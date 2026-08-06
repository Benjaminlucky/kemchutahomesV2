export type InspectionStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Inspection = {
  _id: string;
  estateName: string;
  estateId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inspectionDate: string;
  persons: number;
  status: InspectionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

// Shared shape for both the Create and Edit modal forms.
export type InspectionFormInput = {
  estateName: string;
  estateId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inspectionDate: string;
  persons: number;
  status: InspectionStatus;
  notes: string;
};
