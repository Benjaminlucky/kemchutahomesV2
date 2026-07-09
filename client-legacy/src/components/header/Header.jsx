import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { mainLink } from "../../../data";
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
  const ref = useRef(null);
  const location = useLocation();
  const isClientActive = location.pathname.startsWith("/client");

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className={`relative flex items-center gap-1.5 text-sm lg:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
          isClientActive
            ? "text-customPurple-500 font-semibold"
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
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-customPurple-500 rounded-full" />
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
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl overflow-hidden"
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
                    const active = location.pathname === item.link;
                    return (
                      <Link
                        key={item.link}
                        to={item.link}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                        style={{
                          background: active
                            ? "rgba(112,12,235,0.07)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!active)
                            e.currentTarget.style.background =
                              "rgba(112,12,235,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
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
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: active ? "#700CEB" : "#111" }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-xs truncate"
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

function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isClientActive = location.pathname.startsWith("/client");
  const isBuy2SellActive = location.pathname === "/buy2sell";

  const [openMenu, setOpenMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileClientOpen, setMobileClientOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(false);
    setMobileClientOpen(false);
  }, [location]);
  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openMenu]);

  const toggleMenu = (e) => {
    e?.stopPropagation();
    setOpenMenu((v) => !v);
  };
  const closeMenu = () => setOpenMenu(false);

  const navBarStyle = {
    position: "sticky",
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
          className="w-11/12 lg:w-10/12 mx-auto flex items-center justify-between"
          style={{
            padding: isScrolled ? "10px 0" : "14px 0",
            transition: "padding 0.3s ease",
          }}
        >
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/kemchutaMainLogo.svg"
              alt="Kemchuta Homes Limited"
              className="h-auto transition-all duration-300"
              style={{ width: isScrolled ? "120px" : "140px" }}
            />
          </Link>

          <nav className="flex items-center gap-6 lg:gap-8 xl:gap-10">
            {mainLink.map((link, index) => (
              <div
                key={index}
                className={`mainLink relative whitespace-nowrap ${isActive(link.link) ? "active" : ""}`}
              >
                <Link
                  to={link.link}
                  className="text-sm lg:text-base transition-colors duration-200"
                >
                  {link.name}
                </Link>
              </div>
            ))}

            {/* ── Buy2Sell pill ── */}
            <Link to="/buy2sell" className="relative flex-shrink-0">
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg,#3F0C91,#700CEB)";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(112,12,235,0.35)";
                }}
                onMouseLeave={(e) => {
                  if (!isBuy2SellActive) {
                    e.currentTarget.style.background = "rgba(112,12,235,0.08)";
                    e.currentTarget.style.color = "#700CEB";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <TrendingUp size={13} />
                Buy2Sell
              </span>
            </Link>

            <ClientDropdown />
          </nav>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              to="/login"
              className="text-xs lg:text-sm font-semibold uppercase px-4 lg:px-5 py-2 rounded-full border-2 transition-all duration-200 whitespace-nowrap"
              style={{ borderColor: "rgba(112,12,235,0.35)", color: "#700CEB" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#700CEB";
                e.currentTarget.style.borderColor = "#700CEB";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(112,12,235,0.35)";
                e.currentTarget.style.color = "#700CEB";
              }}
            >
              Realtor Login
            </Link>
            <Link
              to="/signup"
              className="text-xs lg:text-sm font-bold uppercase px-4 lg:px-5 py-2 rounded-full text-white whitespace-nowrap transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
                boxShadow: "0 4px 14px rgba(112,12,235,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(112,12,235,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(112,12,235,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Join as Realtor
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div className="md:hidden" style={navBarStyle}>
        <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between">
          <Link to="/" onClick={closeMenu} className="flex-shrink-0">
            <img
              src="/assets/kemchutaMainLogo.svg"
              alt="Kemchuta Homes Limited"
              className="w-32 sm:w-36 h-auto"
            />
          </Link>
          <button
            type="button"
            onClick={toggleMenu}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
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
                className="fixed left-0 w-full bg-white overflow-y-auto"
                style={{
                  top: "64px",
                  zIndex: 9998,
                  maxHeight: "calc(100dvh - 64px)",
                  boxShadow: "0 16px 48px rgba(112,12,235,0.12)",
                  borderBottom: "1px solid rgba(112,12,235,0.08)",
                }}
              >
                {/* Page links */}
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
                    Navigate
                  </p>
                  {mainLink.map((link, index) => {
                    const active = isActive(link.link);
                    return (
                      <Link
                        key={index}
                        to={link.link}
                        onClick={closeMenu}
                        className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors duration-150 mb-0.5"
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
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#700CEB" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* ── Buy2Sell mobile link ── */}
                <div className="px-4 sm:px-5 pb-1">
                  <Link
                    to="/buy2sell"
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors duration-150 mb-0.5"
                    style={{
                      background: isBuy2SellActive
                        ? "rgba(112,12,235,0.07)"
                        : "transparent",
                    }}
                    onTouchStart={(e) => {
                      if (!isBuy2SellActive)
                        e.currentTarget.style.background =
                          "rgba(112,12,235,0.04)";
                    }}
                    onTouchEnd={(e) => {
                      if (!isBuy2SellActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
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
                        className="w-1.5 h-1.5 rounded-full"
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

                {/* Client Portal accordion */}
                <div className="px-4 sm:px-5 pb-2">
                  <button
                    onClick={() => setMobileClientOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors duration-150"
                    style={{
                      background: isClientActive
                        ? "rgba(112,12,235,0.07)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
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
                        <div className="pl-3 pr-1 pb-2 mt-1">
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
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 py-1.5">
                                {section.label}
                              </p>
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = location.pathname === item.link;
                                return (
                                  <Link
                                    key={item.link}
                                    to={item.link}
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 mb-0.5"
                                    style={{
                                      background: active
                                        ? "rgba(112,12,235,0.07)"
                                        : "transparent",
                                    }}
                                    onTouchStart={(e) => {
                                      if (!active)
                                        e.currentTarget.style.background =
                                          "rgba(112,12,235,0.04)";
                                    }}
                                    onTouchEnd={(e) => {
                                      if (!active)
                                        e.currentTarget.style.background =
                                          "transparent";
                                    }}
                                  >
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
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
                                        className="text-sm font-semibold leading-tight"
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

                {/* Realtor CTAs */}
                <div className="px-4 sm:px-5 py-4 space-y-2.5">
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="flex items-center justify-center w-full py-3 rounded-2xl text-white text-sm font-bold active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #700CEB, #8A2FF0)",
                      boxShadow: "0 4px 16px rgba(112,12,235,0.35)",
                    }}
                  >
                    Join as Realtor
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-bold"
                    style={{
                      border: "2px solid rgba(112,12,235,0.25)",
                      color: "#700CEB",
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background =
                        "rgba(112,12,235,0.06)";
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = "transparent";
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

export default Header;
