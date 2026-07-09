import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ClientProtectedRoute
 * Mirrors the existing ProtectedRoutes.jsx pattern exactly.
 * Uses clientToken + clientUser keys to keep client sessions
 * completely separate from realtor/admin sessions.
 */
const ClientProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("clientToken");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("clientUser"));
    } catch {
      return null;
    }
  })();

  if (!token || !user || user.role !== "client") {
    return <Navigate to="/client/login" replace />;
  }

  return children;
};

export default ClientProtectedRoute;
