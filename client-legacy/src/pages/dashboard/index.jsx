import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Earnings from "./Earnings";
import Recruits from "./Recruits";
import Reports from "./Reports";
import DashboardLayout from "./Layout";
import RealtorDashboard from "./RealtorDashboard";
import AdminDashboard from "./AdminDashboard";
import ManageRealtors from "./ManageRealtors";
import ManageEstates from "./ManageEstates";
import ManageInspections from "./ManageInspections";
import ManageSubscriptions from "./ManageSubscriptions";
import ManageBuy2Sell from "./ManageBuy2Sell";
import ManageContact from "./ManageContact";
import ManageBankAccounts from "./ManageBankAccounts";
import ManageKnowledgeBase from "./ManageKnowledgeBase"; // ← AI Knowledge Base

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<RoleBasedDashboard />} />
        {/* Admin routes */}
        <Route path="realtors" element={<ManageRealtors />} />
        <Route path="estates" element={<ManageEstates />} />
        <Route path="inspections" element={<ManageInspections />} />
        <Route path="subscriptions" element={<ManageSubscriptions />} />
        <Route path="buy2sell" element={<ManageBuy2Sell />} />
        <Route path="contact" element={<ManageContact />} />
        <Route path="bank-accounts" element={<ManageBankAccounts />} />
        <Route path="knowledge-base" element={<ManageKnowledgeBase />} />{" "}
        {/* ← AI Knowledge Base */}
        <Route path="reports" element={<Reports />} />
        {/* Realtor routes */}
        <Route path="earnings" element={<Earnings />} />
        <Route path="recruits" element={<Recruits />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function RoleBasedDashboard() {
  if (typeof window === "undefined") return null;
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <p className="p-8 text-gray-500">Loading...</p>;
  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return (
      <p className="p-8 text-red-500">Invalid session. Please log in again.</p>
    );
  }
  if (!user?.role)
    return <p className="p-8 text-red-500">Invalid user role.</p>;
  return user.role === "admin" ? <AdminDashboard /> : <RealtorDashboard />;
}
