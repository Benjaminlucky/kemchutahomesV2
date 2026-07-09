"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const QUICK_PICKS = [
  { value: 1, emoji: "👤", label: "Just me" },
  { value: 2, emoji: "👥", label: "2 people" },
  { value: 5, emoji: "👨‍👩‍👧‍👦", label: "Small group" },
];

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
            <Icon size={15} style={{ color: error ? "#dc2626" : "#700CEB" }} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}

type InspectionBooking = {
  inspectionDate: string;
  estateName: string;
  persons: number;
  firstName: string;
  lastName: string;
  phone: string;
};

function SuccessScreen({ booking, onClose }: { booking: InspectionBooking; onClose: () => void }) {
  const dateStr = new Date(booking.inspectionDate).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 12px 40px rgba(5,150,105,0.35)" }}
      >
        <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
      </motion.div>
      <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f0a1e", letterSpacing: "-0.04em", marginBottom: 8 }}>
        Booking Confirmed!
      </h3>
      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
        Your inspection has been booked. We&rsquo;ll contact you shortly to
        confirm the details.
      </p>
      <div className="mb-6 w-full rounded-2xl p-5 text-left" style={{ background: "rgba(112,12,235,0.04)", border: "1px solid rgba(112,12,235,0.1)" }}>
        {(
          [
            ["Estate", booking.estateName],
            ["Date", dateStr],
            ["Persons", `${booking.persons} person${booking.persons > 1 ? "s" : ""}`],
            ["Name", `${booking.firstName} ${booking.lastName}`],
            ["Contact", booking.phone],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(112,12,235,0.06)" }}>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#0f0a1e", fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full rounded-xl py-3.5 text-sm font-bold"
        style={{ background: "linear-gradient(135deg,#700CEB,#8A2FF0)", color: "#fff", boxShadow: "0 8px 24px rgba(112,12,235,0.35)" }}
      >
        Done
      </button>
    </motion.div>
  );
}

type InspectionForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inspectionDate: string;
  persons: number;
};

export default function BookInspectionModal({
  isOpen,
  onClose,
  estateName = "",
  estateId = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  estateName?: string;
  estateId?: string | null;
}) {
  const [form, setForm] = useState<InspectionForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inspectionDate: "",
    persons: 1,
  });
  const [customPersons, setCustomPersons] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InspectionForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [booking, setBooking] = useState<InspectionBooking | null>(null);

  // Reset the form when the modal transitions closed -> open, adjusted
  // during render (React's recommended pattern) rather than via a
  // setState-in-effect, which would cost an extra render pass.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setForm({ firstName: "", lastName: "", email: "", phone: "", inspectionDate: "", persons: 1 });
      setCustomPersons("");
      setUseCustom(false);
      setErrors({});
      setApiError("");
      setBooking(null);
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const set = (field: keyof InspectionForm, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const selectQuickPick = (val: number) => {
    setUseCustom(false);
    setCustomPersons("");
    set("persons", val);
  };

  const handleCustomChange = (val: string) => {
    const n = parseInt(val, 10);
    setCustomPersons(val);
    if (!isNaN(n) && n >= 1) {
      setForm((f) => ({ ...f, persons: n }));
      setErrors((e) => ({ ...e, persons: "" }));
    }
  };

  const stepPersons = (delta: number) => {
    const next = Math.max(1, (form.persons || 1) + delta);
    setForm((f) => ({ ...f, persons: next }));
    if (useCustom) setCustomPersons(String(next));
  };

  const validate = (): Partial<Record<keyof InspectionForm, string>> => {
    const e: Partial<Record<keyof InspectionForm, string>> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email is required";
    if (!form.phone.trim() || form.phone.trim().length < 7)
      e.phone = "Valid phone number is required";
    if (!form.inspectionDate) e.inspectionDate = "Please select a date";
    if (!form.persons || form.persons < 1) e.persons = "Enter number of persons";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estateName, estateId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book inspection.");
      setBooking(data.inspection);
      trackEvent("inspection_booked", { estate_name: estateName });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr?: string): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: 12,
    fontSize: 14,
    border: `1.5px solid ${hasErr ? "#dc2626" : "rgba(112,12,235,0.15)"}`,
    background: hasErr ? "rgba(220,38,38,0.03)" : "#fafafa",
    outline: "none",
    color: "#0f0a1e",
    fontWeight: 500,
    transition: "border-color 0.2s",
  });

  const focusOn = (e: React.FocusEvent<HTMLInputElement>, err?: string) => {
    if (!err) e.target.style.borderColor = "rgba(112,12,235,0.45)";
  };
  const focusOff = (e: React.FocusEvent<HTMLInputElement>, err?: string) => {
    if (!err) e.target.style.borderColor = "rgba(112,12,235,0.15)";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
          style={{ background: "rgba(8,4,20,0.75)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
            style={{ background: "#fff", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(112,12,235,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden px-8 py-7" style={{ background: "linear-gradient(135deg,#3F0C91,#700CEB)" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: -40, left: "30%", width: 100, height: 100, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Building2 size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Book Inspection
                    </span>
                  </div>
                  <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", maxWidth: 280 }} className="truncate">
                    {estateName || "Estate Inspection"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl transition-all hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {booking ? (
              <SuccessScreen booking={booking} onClose={onClose} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-8">
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
                  >
                    <AlertTriangle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{apiError}</p>
                  </motion.div>
                )}

                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(112,12,235,0.05)", border: "1px solid rgba(112,12,235,0.12)" }}>
                  <Building2 size={15} style={{ color: "#700CEB", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Estate</p>
                    <p style={{ fontSize: 14, color: "#0f0a1e", fontWeight: 800, letterSpacing: "-0.02em" }}>{estateName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" icon={User} error={errors.firstName}>
                    <input
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="John"
                      style={inputStyle(errors.firstName)}
                      onFocus={(e) => focusOn(e, errors.firstName)}
                      onBlur={(e) => focusOff(e, errors.firstName)}
                    />
                  </Field>
                  <Field label="Last Name" icon={User} error={errors.lastName}>
                    <input
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      placeholder="Doe"
                      style={inputStyle(errors.lastName)}
                      onFocus={(e) => focusOn(e, errors.lastName)}
                      onBlur={(e) => focusOff(e, errors.lastName)}
                    />
                  </Field>
                </div>

                <Field label="Email Address" icon={Mail} error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="john@example.com"
                    style={inputStyle(errors.email)}
                    onFocus={(e) => focusOn(e, errors.email)}
                    onBlur={(e) => focusOff(e, errors.email)}
                  />
                </Field>

                <Field label="Phone Number" icon={Phone} error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    style={inputStyle(errors.phone)}
                    onFocus={(e) => focusOn(e, errors.phone)}
                    onBlur={(e) => focusOff(e, errors.phone)}
                  />
                </Field>

                <Field label="Preferred Inspection Date" icon={Calendar} error={errors.inspectionDate}>
                  <input
                    type="date"
                    value={form.inspectionDate}
                    onChange={(e) => set("inspectionDate", e.target.value)}
                    min={getMinDate()}
                    style={inputStyle(errors.inspectionDate)}
                    onFocus={(e) => focusOn(e, errors.inspectionDate)}
                    onBlur={(e) => focusOff(e, errors.inspectionDate)}
                  />
                </Field>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Users size={13} style={{ color: "#700CEB" }} />
                    Number of Persons
                  </label>

                  <div className="mb-3 grid grid-cols-3 gap-3">
                    {QUICK_PICKS.map((opt) => {
                      const active = !useCustom && form.persons === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => selectQuickPick(opt.value)}
                          className="flex flex-col items-center rounded-2xl px-2 py-3 text-center transition-all"
                          style={{
                            border: active ? "2px solid #700CEB" : "1.5px solid rgba(112,12,235,0.12)",
                            background: active ? "rgba(112,12,235,0.06)" : "#fafafa",
                            boxShadow: active ? "0 4px 16px rgba(112,12,235,0.15)" : "none",
                          }}
                        >
                          <span style={{ fontSize: 20, marginBottom: 2 }}>{opt.emoji}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: active ? "#700CEB" : "#0f0a1e" }}>
                            {opt.value === 1 ? "1 Person" : `${opt.value} People`}
                          </span>
                          <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, marginTop: 1 }}>{opt.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustom(true);
                        setCustomPersons(String(form.persons));
                      }}
                      style={{ fontSize: 12, fontWeight: 700, color: "#700CEB", background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: 8, textDecoration: "underline" }}
                    >
                      Enter custom group size
                    </button>

                    {useCustom && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{ background: "rgba(112,12,235,0.04)", border: "1.5px solid rgba(112,12,235,0.18)" }}
                      >
                        <button
                          type="button"
                          onClick={() => stepPersons(-1)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all"
                          style={{ background: "rgba(112,12,235,0.1)", color: "#700CEB" }}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={customPersons}
                          onChange={(e) => handleCustomChange(e.target.value)}
                          placeholder="e.g. 12"
                          style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#700CEB", background: "transparent", border: "none", outline: "none", fontFamily: "inherit" }}
                        />
                        <button
                          type="button"
                          onClick={() => stepPersons(1)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all"
                          style={{ background: "rgba(112,12,235,0.1)", color: "#700CEB" }}
                        >
                          <Plus size={14} />
                        </button>
                        <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>{form.persons === 1 ? "person" : "people"}</span>
                      </motion.div>
                    )}
                    {errors.persons && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 500 }}>{errors.persons}</p>}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold"
                  style={{
                    background: loading ? "rgba(112,12,235,0.5)" : "linear-gradient(135deg,#700CEB,#8A2FF0)",
                    color: "#fff",
                    boxShadow: loading ? "none" : "0 8px 28px rgba(112,12,235,0.38)",
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Booking...
                    </>
                  ) : (
                    <>
                      <Calendar size={17} /> Confirm Inspection
                    </>
                  )}
                </motion.button>

                <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: -4 }}>
                  Our team will reach out to confirm your booking within 24
                  hours
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
