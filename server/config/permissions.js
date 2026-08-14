// Single source of truth for admin section permissions — one key per
// ADMIN_NAV entry in client/src/components/dashboard/DashboardShell.tsx.
// Superadmins bypass this list entirely (see hasPermission() in
// middlewares/authMiddleware.js); regular admins are restricted to
// whichever of these keys they've been granted.
export const ADMIN_PERMISSIONS = [
  { key: "manage_realtors", label: "Manage Realtors" },
  { key: "manage_estates", label: "Manage Estates" },
  { key: "manage_inspections", label: "Manage Inspections" },
  { key: "manage_subscriptions", label: "Manage Subscriptions" },
  { key: "buy2sell", label: "Buy2Sell" },
  { key: "commissions", label: "Commissions" },
  { key: "contact_info", label: "Contact Info" },
  { key: "bank_accounts", label: "Bank Accounts" },
  { key: "knowledge_base", label: "AI Knowledge Base" },
  { key: "reports", label: "Reports" },
];

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((p) => p.key);
