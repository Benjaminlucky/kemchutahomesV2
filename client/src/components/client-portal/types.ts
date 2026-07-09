// Shapes matching the real GET /api/clients/dashboard response
// (server/controllers/client.controller.js getClientDashboard) — not the
// legacy SPA's ClientPortal.jsx, which references a recentInspections field
// the API doesn't actually return.
export type PortalSubscription = {
  _id: string;
  estateName: string;
  referenceNumber: string;
  plotSize: string;
  plotType: string;
  numberOfPlots: number;
  totalAmount: number;
  amountPaid: number;
  status: string;
  createdAt: string;
};

export type PortalInvestment = {
  _id: string;
  duration: string;
  referenceNumber: string;
  principalAmount: number;
  status: string;
  expectedPayout?: number;
};

export type DashboardStats = {
  totalSubscriptions: number;
  approvedSubscriptions: number;
  pendingSubscriptions: number;
  totalAmountPaid: number;
  totalInvestments: number;
  activeInvestments: number;
  pendingInvestments: number;
  totalInvested: number;
  totalExpectedROI: number;
  totalExpectedPayout: number;
  maturingInvestments: number;
  paidOutInvestments: number;
};

export type ClientDashboard = {
  stats: DashboardStats;
  recentSubscriptions: PortalSubscription[];
  recentInvestments: PortalInvestment[];
  subscriptions: PortalSubscription[];
  investments: PortalInvestment[];
};
