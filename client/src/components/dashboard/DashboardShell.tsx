"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  ClipboardList,
  Landmark,
  Contact,
  CreditCard,
  Bot,
  BarChart3,
  Wallet,
  Percent,
  Menu,
  X,
} from "lucide-react";
import LogoutButton from "@/components/client-auth/LogoutButton";
import QueryProvider from "@/components/dashboard/QueryProvider";

type NavItem = { name: string; path: string; icon: typeof LayoutDashboard };

const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Manage Realtors", path: "/dashboard/realtors", icon: Users },
  { name: "Manage Estates", path: "/dashboard/estates", icon: Building2 },
  { name: "Manage Inspections", path: "/dashboard/inspections", icon: CalendarCheck },
  { name: "Manage Subscriptions", path: "/dashboard/subscriptions", icon: ClipboardList },
  { name: "Buy2Sell", path: "/dashboard/buy2sell", icon: Landmark },
  { name: "Commissions", path: "/dashboard/commissions", icon: Percent },
  { name: "Contact Info", path: "/dashboard/contact", icon: Contact },
  { name: "Bank Accounts", path: "/dashboard/bank-accounts", icon: CreditCard },
  { name: "AI Knowledge Base", path: "/dashboard/knowledge-base", icon: Bot },
  { name: "Reports", path: "/dashboard/reports", icon: BarChart3 },
];

const REALTOR_NAV: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Recruits", path: "/dashboard/recruits", icon: Users },
  { name: "Earnings", path: "/dashboard/earnings", icon: Wallet },
];

function SidebarNav({
  navItems,
  role,
  pathname,
  onItemClick,
}: {
  navItems: NavItem[];
  role: "admin" | "realtor";
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <>
      <div>
        <h1 className="mb-8 pl-3 text-2xl font-bold text-white">Kemchuta Dashboard</h1>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                href={item.path}
                key={item.path}
                onClick={onItemClick}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white transition ${
                  isActive ? "bg-customPurple-900/80 font-semibold" : "hover:bg-customPurple-900"
                }`}
              >
                <Icon size={17} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6 px-4">
        <LogoutButton redirectTo={role === "admin" ? "/admin/login" : "/login"} variant="dark" />
      </div>
    </>
  );
}

export default function DashboardShell({
  role,
  children,
}: {
  role: "admin" | "realtor";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = role === "admin" ? ADMIN_NAV : REALTOR_NAV;
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative flex min-h-screen bg-[#fdfdfd]">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="text-customPurple-600"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col justify-between bg-customPurple-600 px-4 py-6 shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav navItems={navItems} role={role} pathname={pathname} onItemClick={closeMenu} />
      </aside>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between bg-customPurple-500 px-4 py-6 lg:flex">
        <SidebarNav navItems={navItems} role={role} pathname={pathname} onItemClick={closeMenu} />
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#fafafa] p-6 sm:p-8">
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  );
}
