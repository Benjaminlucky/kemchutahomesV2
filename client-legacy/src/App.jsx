import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Existing pages (UNCHANGED)
import Home from "./pages/home/Home";
import Company from "./pages/company/Company";
import Developments from "./pages/developments/Developments";
import Contact from "./pages/contact/Contact";
import EstateDetails from "./pages/EstateDetails";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/dashboard";

// Existing layout (UNCHANGED)
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoutes";
import NotFound from "./pages/notfound/NotFound";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/resetPassword";
import AdminForgotPassword from "./pages/admin-forgot-password/AdminForgotPassword";
import AdminResetPassword from "./pages/admin-reset-password/AdminResetPassword";
import Buy2SellPage from "./pages/buy2sell/Buy2SellPage";

// ── Client portal ────────────────────────────────────────────────────────────
import ClientLogin from "./pages/client-login/ClientLogin";
import ClientSignup from "./pages/client-signup/ClientSignup";
import ClientForgotPassword from "./pages/client-forgot-password/ClientForgotPassword";
import ClientResetPassword from "./pages/client-reset-password/ClientResetPassword";
import ClientPortal from "./pages/client-portal/ClientPortal";
import ClientProtectedRoute from "./components/client-portal/ClientProtectedRoute";

// ── AI chat widget — floats on all public pages ──────────────────────────────
import ChatWidget from "./components/chat/ChatWidget";

// ── Announcement bar — sits above header, driven by knowledge base notices ───
import AnnouncementBar from "./components/announcements/AnnouncementBar";

function AppWrapper() {
  const location = useLocation();

  // Hide header/footer inside dashboard and client portal
  const hideLayout =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/client/portal");

  // Hide chat widget inside admin dashboard (not needed there)
  const hideChatWidget = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hideLayout && <AnnouncementBar />}
      {!hideLayout && <Header />}
      <main
        className={`${hideLayout ? "" : "pt-0"} relative overflow-x-hidden bg-white min-h-screen`}
      >
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/developments" element={<Developments />} />
          <Route path="/estate/:estateName" element={<EstateDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/buy2sell" element={<Buy2SellPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin/forgot-password"
            element={<AdminForgotPassword />}
          />
          <Route
            path="/admin/reset-password"
            element={<AdminResetPassword />}
          />

          {/* ── Admin dashboard ───────────────────────────────────────────── */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Client portal ─────────────────────────────────────────────── */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/register" element={<ClientSignup />} />
          <Route
            path="/client/forgot-password"
            element={<ClientForgotPassword />}
          />
          <Route
            path="/client/reset-password"
            element={<ClientResetPassword />}
          />
          <Route
            path="/client/portal/*"
            element={
              <ClientProtectedRoute>
                <ClientPortal />
              </ClientProtectedRoute>
            }
          />

          {/* ── 404 — always last ─────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {!hideLayout && <Footer />}
      </main>

      {/* ── AI Chat Widget — visible on all pages except admin dashboard ──── */}
      {!hideChatWidget && <ChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}
