export type AdminRole = "admin" | "superadmin";
export type AdminStatus = "pending" | "active" | "suspended";

export type PermissionOption = { key: string; label: string };

export type AdminUser = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: AdminRole;
  permissions: string[];
  status: AdminStatus;
  createdAt?: string;
};

export type AdminListResponse = {
  docs: AdminUser[];
  total: number;
  page: number;
  pages: number;
};

export type InviteAdminInput = {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
};

export type UpdateAdminInput = {
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
};
