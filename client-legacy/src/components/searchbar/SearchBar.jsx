import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X,
} from "lucide-react";

const locationOptions = [
  "Choose Location",
  "Lagos",
  "Asaba",
  "Anambra",
  "Abuja",
];
const purposeOptions = [
  "Any Purpose",
  "Residential",
  "Commercial",
  "Investment",
];

function Dropdown({ options, value, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = value !== options[0];

  return (
    <div ref={ref} className="relative" style={{ zIndex: open ? 9999 : 1 }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
        style={{
          background: isActive
            ? "rgba(255,255,255,0.25)"
            : "rgba(255,255,255,0.12)",
          color: "#fff",
          border: isActive
            ? "1.5px solid rgba(255,255,255,0.7)"
            : "1.5px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Icon size={15} style={{ opacity: 0.85 }} />
        {value}
        <ChevronDown
          size={14}
          style={{
            opacity: 0.7,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 min-w-[180px] overflow-hidden rounded-xl"
            style={{
              zIndex: 9999,
              background: "#fff",
              boxShadow:
                "0 20px 60px rgba(112,12,235,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1px solid rgba(112,12,235,0.1)",
            }}
          >
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
                style={{
                  color: value === opt ? "#700CEB" : "#374151",
                  fontWeight: value === opt ? 700 : 500,
                  background:
                    value === opt ? "rgba(112,12,235,0.06)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt)
                    e.currentTarget.style.background = "rgba(112,12,235,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: value === opt ? "#700CEB" : "transparent",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchHero({ onSearch }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Choose Location");
  const [purpose, setPurpose] = useState("Any Purpose");

  // Fire filter update whenever any value changes — live filtering
  const emitFilters = (overrides = {}) => {
    onSearch?.({
      query,
      location,
      purpose,
      ...overrides,
    });
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    emitFilters({ query: val });
  };

  const handleLocationChange = (val) => {
    setLocation(val);
    emitFilters({ location: val });
  };

  const handlePurposeChange = (val) => {
    setPurpose(val);
    emitFilters({ purpose: val });
  };

  const handleClear = () => {
    setQuery("");
    setLocation("Choose Location");
    setPurpose("Any Purpose");
    onSearch?.({
      query: "",
      location: "Choose Location",
      purpose: "Any Purpose",
    });
  };

  const hasActiveFilters =
    query !== "" || location !== "Choose Location" || purpose !== "Any Purpose";

  return (
    <div
      className="search__hero w-full relative"
      style={{
        background:
          "linear-gradient(135deg, #3F0C91 0%, #700CEB 55%, #8A2FF0 100%)",
      }}
    >
      {/* Decorations layer — overflow hidden kept here only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "8%",
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "38%",
            width: "1px",
            height: "100%",
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "62%",
            width: "1px",
            height: "100%",
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "25%",
            width: 320,
            height: 120,
            background: "rgba(138,47,240,0.35)",
            filter: "blur(60px)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative w-full px-6 md:px-16 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8"
        style={{ zIndex: 200 }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Left label */}
        <div className="hidden md:flex flex-col gap-1 shrink-0">
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <SlidersHorizontal size={12} /> Property Search
          </div>
          <p
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
          >
            Find your
            <br />
            <span style={{ color: "rgba(239,194,255,0.9)" }}>
              dream estate.
            </span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1 md:max-w-3xl">
          {/* Search input */}
          <div
            className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <Search size={16} style={{ color: "#700CEB", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by estate name…"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full outline-none bg-transparent text-sm"
              style={{ color: "#1a1a2e", fontWeight: 500 }}
            />
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                style={{ color: "#aaa", display: "flex", alignItems: "center" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdowns */}
          <div
            className="flex items-center gap-2"
            style={{ position: "relative", zIndex: 9999 }}
          >
            <Dropdown
              options={locationOptions}
              value={location}
              onChange={handleLocationChange}
              icon={MapPin}
            />
            <Dropdown
              options={purposeOptions}
              value={purpose}
              onChange={handlePurposeChange}
              icon={Briefcase}
            />
          </div>

          {/* Right side: Search + optional Clear */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={() => emitFilters()}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{
                background: "#fff",
                color: "#700CEB",
                boxShadow:
                  "0 4px 20px rgba(112,12,235,0.25), 0 1px 4px rgba(0,0,0,0.1)",
                letterSpacing: "-0.01em",
              }}
            >
              <Search size={15} strokeWidth={2.5} />
              Search
            </motion.button>

            {/* Clear all filters button — only shows when filters are active */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  onClick={handleClear}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.85)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <X size={13} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)",
        }}
      />
    </div>
  );
}

export default SearchHero;
