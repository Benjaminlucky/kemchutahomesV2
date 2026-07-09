"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoMenu, IoCloseCircle } from "react-icons/io5";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  KeyRound,
  UserPlus,
  FileText,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { mainLink } from "@/lib/navLinks";
import "./header.css";

const clientMenuSections = [
  {
    label: "My Portal",
    items: [
      {
        name: "Client Portal",
        desc: "Access your dashboard",
        link: "/client/portal",
        icon: LayoutDashboard,
      },
      {
        name: "My Subscriptions",
        desc: "Track your land orders",
        link: "/client/portal/subscriptions",
        icon: FileText,
      },
      {
        name: "My Inspections",
        desc: "View booked site visits",
        link: "/client/portal/inspections",
        icon: CalendarCheck,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Client Login",
        desc: "Sign in to your portal",
        link: "/client/login",
        icon: KeyRound,
      },
      {
        name: "Client Sign Up",
        desc: "Register as a new client",
        link: "/client/register",
        icon: UserPlus,
      },
    ],
  },
];

function ClientDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isClientActive = pathname.startsWith("/client");

  // Close the dropdown on route change — adjusted during render (React's
  // recommended pattern for resetting state when a value changes) rather
  // than via a setState-in-effect, which would cost an extra render pass.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className={`relative flex items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors duration-200 lg:text-base ${
          isClientActive
            ? "font-semibold text-customPurple-500"
            : "text-customBlack-700 hover:text-customPurple-500"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User size={14} className="opacity-70" />
        Client Portal
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown size={14} className="opacity-70" />
        </motion.span>
        {isClientActive && (
          <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-customPurple-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full left-1/2 mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-2xl"
            style={{
              zIndex: 9999,
              boxShadow:
                "0 24px 60px rgba(112,12,235,0.15), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1px solid rgba(112,12,235,0.1)",
              background: "#fff",
            }}
          >
            {clientMenuSections.map((section, si) => (
              <div key={section.label}>
                {si > 0 && (
                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(to right, transparent, rgba(112,12,235,0.12), transparent)",
                      margin: "0 12px",
                    }}
                  />
                )}
                <div className="p-2">
                  <p
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#9ca3af" }}
                  >
                    {section.label}
                  </p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.link;
                    return (
                      <Link
                        key={item.link}
                        href={item.link}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                        style={{
                          background: active
                            ? "rgba(112,12,235,0.07)"
                            : "transparent",
                        }}
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{
                            background: active
                              ? "rgba(112,12,235,0.12)"
                              : "rgba(112,12,235,0.07)",
                          }}
                        >
                          <Icon
                            size={15}
                            style={{
                              color: "#700CEB",
                              opacity: active ? 1 : 0.7,
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-semibold"
                            style={{ color: active ? "#700CEB" : "#111" }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="truncate text-xs"
                            style={{ color: "#9ca3af" }}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const isClientActive = pathname.startsWith("/client");
  const isBuy2SellActive = pathname === "/buy2sell";

  const [openMenu, setOpenMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileClientOpen, setMobileClientOpen] = useState(false);

  // Close the mobile menu on route change — adjusted during render rather
  // than via a setState-in-effect (see ClientDropdown above for why).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(false);
    setMobileClientOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openMenu]);

  const toggleMenu = () => setOpenMenu((v) => !v);
  const closeMenu = () => setOpenMenu(false);

  const navBarStyle = {
    position: "sticky" as const,
    top: 0,
    zIndex: 9995,
    background: isScrolled ? "rgba(255,255,255,0.88)" : "#fff",
    backdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "none",
    WebkitBackdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "none",
    borderBottom: isScrolled
      ? "1px solid rgba(112,12,235,0.1)"
      : "1px solid rgba(0,0,0,0.06)",
    boxShadow: isScrolled
      ? "0 4px 24px rgba(112,12,235,0.08)"
      : "0 1px 3px rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
  };

  return (
    <div className="mainNavWrapper w-full">
      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden md:block" style={navBarStyle}>
        <div
          className="mx-auto flex w-11/12 items-center justify-between lg:w-10/12"
          style={{
            padding: isScrolled ? "10px 0" : "14px 0",
            transition: "padding 0.3s ease",
          }}
        >
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/kemchutaMainLogo.svg"
              alt="Kemchuta Homes Limited"
              width={140}
              height={40}
              priority
              style={{ width: isScrolled ? "120px" : "140px", height: "auto" }}
            />
          </Link>

          <nav className="flex items-center gap-6 lg:gap-8 xl:gap-10">
            {mainLink.map((link) => (
              <div
                key={link.link}
                className={`mainLink relative whitespace-nowrap ${isActive(link.link) ? "active" : ""}`}
              >
                <Link
                  href={link.link}
                  className="text-sm transition-colors duration-200 lg:text-base"
                >
                  {link.name}
                </Link>
              </div>
            ))}

            <Link href="/buy2sell" className="relative flex-shrink-0">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: isBuy2SellActive
                    ? "linear-gradient(135deg,#3F0C91,#700CEB)"
                    : "rgba(112,12,235,0.08)",
                  color: isBuy2SellActive ? "#fff" : "#700CEB",
                  fontWeight: 700,
                  fontSize: "13px",
                  transition: "all 0.2s",
                  boxShadow: isBuy2SellActive
                    ? "0 2px 10px rgba(112,12,235,0.35)"
                    : "none",
                }}
              >
                <TrendingUp size={13} />
                Buy2Sell
              </span>
            </Link>

            <ClientDropdown />
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase whitespace-nowrap transition-all duration-200 lg:px-5 lg:text-sm"
              style={{ borderColor: "rgba(112,12,235,0.35)", color: "#700CEB" }}
            >
              Realtor Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-2 text-xs font-bold text-white uppercase whitespace-nowrap transition-all duration-200 lg:px-5 lg:text-sm"
              style={{
                background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
                boxShadow: "0 4px 14px rgba(112,12,235,0.35)",
              }}
            >
              Join as Realtor
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div className="md:hidden" style={navBarStyle}>
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
          <Link href="/" onClick={closeMenu} className="flex-shrink-0">
            <Image
              src="/assets/kemchutaMainLogo.svg"
              alt="Kemchuta Homes Limited"
              width={128}
              height={36}
              priority
              className="h-auto w-32 sm:w-36"
            />
          </Link>
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
            style={{
              background: openMenu
                ? "rgba(112,12,235,0.1)"
                : "rgba(0,0,0,0.04)",
              color: openMenu ? "#700CEB" : "#374151",
            }}
            aria-label={openMenu ? "Close menu" : "Open menu"}
            aria-expanded={openMenu}
          >
            <AnimatePresence mode="wait" initial={false}>
              {openMenu ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <IoCloseCircle size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <IoMenu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {openMenu && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                style={{ top: 0, zIndex: 9996 }}
                onClick={closeMenu}
                aria-hidden="true"
              />

              <motion.div
                key="panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed left-0 w-full overflow-y-auto bg-white"
                style={{
                  top: "64px",
                  zIndex: 9998,
                  maxHeight: "calc(100dvh - 64px)",
                  boxShadow: "0 16px 48px rgba(112,12,235,0.12)",
                  borderBottom: "1px solid rgba(112,12,235,0.08)",
                }}
              >
                <div className="px-4 pt-4 pb-2 sm:px-5">
                  <p className="mb-2 px-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Navigate
                  </p>
                  {mainLink.map((link) => {
                    const active = isActive(link.link);
                    return (
                      <Link
                        key={link.link}
                        href={link.link}
                        onClick={closeMenu}
                        className="mb-0.5 flex items-center justify-between rounded-xl px-3 py-3 transition-colors duration-150"
                        style={{
                          background: active
                            ? "rgba(112,12,235,0.07)"
                            : "transparent",
                        }}
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: active ? "#700CEB" : "#111" }}
                        >
                          {link.name}
                        </span>
                        {active && (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "#700CEB" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="px-4 pb-1 sm:px-5">
                  <Link
                    href="/buy2sell"
                    onClick={closeMenu}
                    className="mb-0.5 flex items-center justify-between rounded-xl px-3 py-3 transition-colors duration-150"
                    style={{
                      background: isBuy2SellActive
                        ? "rgba(112,12,235,0.07)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: "linear-gradient(135deg,#3F0C91,#700CEB)",
                        }}
                      >
                        <TrendingUp size={13} style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: isBuy2SellActive ? "#700CEB" : "#111",
                          }}
                        >
                          Buy2Sell
                        </p>
                        <p className="text-xs text-gray-400">
                          Invest &amp; earn up to 75% ROI
                        </p>
                      </div>
                    </div>
                    {isBuy2SellActive && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: "#700CEB" }}
                      />
                    )}
                  </Link>
                </div>

                <div
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(to right, transparent, rgba(112,12,235,0.12), transparent)",
                    margin: "4px 20px 8px",
                  }}
                />

                <div className="px-4 pb-2 sm:px-5">
                  <button
                    onClick={() => setMobileClientOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors duration-150"
                    style={{
                      background: isClientActive
                        ? "rgba(112,12,235,0.07)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: "rgba(112,12,235,0.1)" }}
                      >
                        <User size={13} style={{ color: "#700CEB" }} />
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isClientActive ? "#700CEB" : "#111" }}
                      >
                        Client Portal
                      </span>
                    </div>
                    <motion.span
                      animate={{ rotate: mobileClientOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex text-gray-400"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileClientOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 pr-1 pb-2 pl-3">
                          {clientMenuSections.map((section, si) => (
                            <div key={section.label}>
                              {si > 0 && (
                                <div
                                  style={{
                                    height: 1,
                                    background:
                                      "linear-gradient(to right, transparent, rgba(112,12,235,0.1), transparent)",
                                    margin: "6px 12px",
                                  }}
                                />
                              )}
                              <p className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                {section.label}
                              </p>
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = pathname === item.link;
                                return (
                                  <Link
                                    key={item.link}
                                    href={item.link}
                                    onClick={closeMenu}
                                    className="mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150"
                                    style={{
                                      background: active
                                        ? "rgba(112,12,235,0.07)"
                                        : "transparent",
                                    }}
                                  >
                                    <div
                                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                                      style={{
                                        background: active
                                          ? "rgba(112,12,235,0.12)"
                                          : "rgba(112,12,235,0.06)",
                                      }}
                                    >
                                      <Icon
                                        size={13}
                                        style={{
                                          color: "#700CEB",
                                          opacity: active ? 1 : 0.7,
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <p
                                        className="text-sm leading-tight font-semibold"
                                        style={{
                                          color: active ? "#700CEB" : "#111",
                                        }}
                                      >
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(to right, transparent, rgba(112,12,235,0.12), transparent)",
                    margin: "4px 20px 8px",
                  }}
                />

                <div className="space-y-2.5 px-4 py-4 sm:px-5">
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-bold text-white active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
                      boxShadow: "0 4px 16px rgba(112,12,235,0.35)",
                    }}
                  >
                    Join as Realtor
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-bold"
                    style={{
                      border: "2px solid rgba(112,12,235,0.25)",
                      color: "#700CEB",
                    }}
                  >
                    Realtor Login
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
