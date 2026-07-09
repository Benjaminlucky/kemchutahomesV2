import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Building2,
  MapPin,
  AlertTriangle,
  X,
  CheckCircle,
  Loader2,
  ImagePlus,
  ChevronDown,
  Youtube,
  GripVertical,
  TrendingUp,
  Home,
  ArrowUpRight,
  LayoutGrid,
} from "lucide-react";
import {
  createEstate,
  updateEstate,
  deleteEstate,
  fetchEstates,
  toggleEstate,
} from "../../services/estateServices.js";

// ── Constants ────────────────────────────────────────────────────────────────
const LOCATIONS = ["Lagos", "Asaba", "Anambra", "Abuja"];
const PURPOSES = ["Residential", "Commercial", "Investment"];
const TITLES = [
  "CofO",
  "Gazette",
  "Excision",
  "Freehold",
  "Registered survey",
  "CofO in-view",
];
const CATEGORIES = ["Land", "House", "Duplex", "Flat", "Commercial"];

const PURPOSE_STYLE = {
  Residential: {
    bg: "rgba(112,12,235,0.08)",
    color: "#700CEB",
    glow: "rgba(112,12,235,0.15)",
    icon: Home,
  },
  Commercial: {
    bg: "rgba(234,88,12,0.08)",
    color: "#ea580c",
    glow: "rgba(234,88,12,0.12)",
    icon: Building2,
  },
  Investment: {
    bg: "rgba(5,150,105,0.08)",
    color: "#059669",
    glow: "rgba(5,150,105,0.12)",
    icon: TrendingUp,
  },
};

const EMPTY_FORM = {
  estate: "",
  address: "",
  location: "Lagos",
  purpose: "Residential",
  title: "CofO",
  price: "",
  sqm: "",
  desc: "",
  category: "Land",
  depositPercentage: "30% Initial Deposit",
  sytemap: "",
  amenities: [],
  neighborhood: [],
  paymentPlan: [],
  videos: [],
};

const extractYoutubeId = (input) => {
  if (!input) return null;
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  const match = clean.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl"
      style={{
        background:
          type === "success"
            ? "linear-gradient(135deg,#059669,#047857)"
            : "linear-gradient(135deg,#dc2626,#b91c1c)",
        color: "#fff",
        minWidth: 280,
      }}
    >
      {type === "success" ? (
        <CheckCircle size={18} />
      ) : (
        <AlertTriangle size={18} />
      )}
      <span style={{ fontSize: 14, fontWeight: 600 }}>{message}</span>
      <button onClick={onClose} className="ml-auto">
        <X size={16} />
      </button>
    </motion.div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: "rgba(8,4,20,0.7)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(220,38,38,0.1)" }}
        >
          <AlertTriangle size={28} style={{ color: "#dc2626" }} />
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0f0a1e",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Are you sure?
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: "#f3f4f6", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "#fff",
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── List Editor ───────────────────────────────────────────────────────────────
function ListEditor({ label, items, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (!val) return;
    onChange([...items, { name: val }]);
    setInput("");
  };
  return (
    <div>
      <label
        style={{
          fontSize: 12,
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
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            border: "1.5px solid rgba(112,12,235,0.15)",
            background: "#fafafa",
          }}
        />
        <button
          onClick={add}
          type="button"
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "#700CEB", color: "#fff" }}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(112,12,235,0.08)", color: "#700CEB" }}
          >
            {item.name}
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              type="button"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payment Plan Editor ───────────────────────────────────────────────────────
function PaymentPlanEditor({ plans, onChange }) {
  const update = (i, field, value) => {
    const updated = [...plans];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#6b7280",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Payment Plans
        </label>
        <button
          onClick={() =>
            onChange([...plans, { plot: "", outright: "", initialDeposit: "" }])
          }
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "#700CEB", color: "#fff" }}
        >
          <Plus size={12} /> Add Plan
        </button>
      </div>
      {plans.map((plan, i) => (
        <div
          key={i}
          className="grid grid-cols-3 gap-2 mb-3 p-3 rounded-xl relative"
          style={{
            background: "rgba(112,12,235,0.04)",
            border: "1px solid rgba(112,12,235,0.1)",
          }}
        >
          {["plot", "outright", "initialDeposit"].map((field) => (
            <input
              key={field}
              value={plan[field] || ""}
              onChange={(e) => update(i, field, e.target.value)}
              placeholder={
                field === "plot"
                  ? "Plot size"
                  : field === "outright"
                    ? "Outright price"
                    : "Initial deposit"
              }
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                border: "1.5px solid rgba(112,12,235,0.15)",
                background: "#fff",
              }}
            />
          ))}
          <button
            onClick={() => onChange(plans.filter((_, idx) => idx !== i))}
            type="button"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#dc2626", color: "#fff" }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── YouTube Videos Editor ─────────────────────────────────────────────────────
function VideosEditor({ videos, onChange }) {
  const [input, setInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    const id = extractYoutubeId(input.trim());
    if (!id) {
      setError("Invalid YouTube URL or ID");
      return;
    }
    if (videos.find((v) => v.videoId === id)) {
      setError("Video already added");
      return;
    }
    onChange([
      ...videos,
      {
        videoId: id,
        title: titleInput.trim(),
        url: `https://www.youtube.com/embed/${id}`,
      },
    ]);
    setInput("");
    setTitleInput("");
    setError("");
  };

  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 8,
        }}
      >
        YouTube Videos
      </label>
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2">
          <div
            className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
            style={{
              border: "1.5px solid rgba(112,12,235,0.15)",
              background: "#fafafa",
            }}
          >
            <Youtube size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), add())
              }
              placeholder="Paste YouTube URL or video ID"
              className="flex-1 outline-none bg-transparent text-sm"
              style={{ color: "#0f0a1e" }}
            />
          </div>
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Video title (optional)"
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              border: "1.5px solid rgba(112,12,235,0.15)",
              background: "#fafafa",
            }}
          />
          <button
            onClick={add}
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap"
            style={{ background: "#dc2626", color: "#fff" }}
          >
            Add
          </button>
        </div>
        {error && (
          <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>
            {error}
          </p>
        )}
      </div>
      {videos.length > 0 && (
        <div className="flex flex-col gap-2">
          {videos.map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(220,38,38,0.04)",
                border: "1px solid rgba(220,38,38,0.12)",
              }}
            >
              <Youtube size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p
                  style={{ fontSize: 13, fontWeight: 600, color: "#0f0a1e" }}
                  className="truncate"
                >
                  {v.title || `Video ${i + 1}`}
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>
                  ID: {v.videoId}
                </p>
              </div>
              <img
                src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                alt=""
                className="rounded-lg object-cover"
                style={{ width: 64, height: 42, flexShrink: 0 }}
              />
              <button
                onClick={() => onChange(videos.filter((_, idx) => idx !== i))}
                type="button"
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(220,38,38,0.15)", color: "#dc2626" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({ label, preview, onChange, required, hint }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 8,
        }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
        {hint && (
          <span
            style={{
              color: "#9ca3af",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            {" "}
            — {hint}
          </span>
        )}
      </label>
      <label
        className="flex items-center justify-center w-full rounded-2xl cursor-pointer overflow-hidden"
        style={{
          border: "2px dashed rgba(112,12,235,0.25)",
          background: "rgba(112,12,235,0.03)",
          minHeight: 120,
        }}
      >
        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="preview"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: 220 }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
              style={{ background: "rgba(112,12,235,0.4)" }}
            >
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                Click to change
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <ImagePlus size={28} style={{ color: "#700CEB", opacity: 0.4 }} />
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
              Click to upload
            </span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

// ── Gallery Upload Zone ───────────────────────────────────────────────────────
function GalleryUploadZone({ previews, onAdd, onRemove }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 8,
        }}
      >
        Gallery Images
        <span
          style={{
            color: "#9ca3af",
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {" "}
          — up to 15 photos
        </span>
      </label>
      <div className="flex flex-wrap gap-3">
        {previews.map((img, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden group"
            style={{ width: 88, height: 66 }}
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <button
                onClick={() => onRemove(i)}
                type="button"
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#dc2626", color: "#fff" }}
              >
                <X size={11} />
              </button>
            </div>
            {img.isExisting && (
              <div
                className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  fontSize: 9,
                }}
              >
                saved
              </div>
            )}
          </div>
        ))}
        {previews.length < 15 && (
          <label
            className="flex flex-col items-center justify-center rounded-xl cursor-pointer"
            style={{
              width: 88,
              height: 66,
              border: "2px dashed rgba(112,12,235,0.25)",
              background: "rgba(112,12,235,0.03)",
            }}
          >
            <Plus size={18} style={{ color: "#700CEB", opacity: 0.4 }} />
            <span style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
              Add photo
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onAdd}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ── Estate Form Modal ─────────────────────────────────────────────────────────
function EstateFormModal({ estate, onClose, onSaved }) {
  const isEdit = !!estate;
  const [form, setForm] = useState(
    isEdit
      ? {
          estate: estate.estate,
          address: estate.address,
          location: estate.location,
          purpose: estate.purpose,
          title: estate.title,
          price: estate.price,
          sqm: estate.sqm,
          desc: estate.desc,
          category: estate.category || "Land",
          depositPercentage: estate.depositPercentage || "30% Initial Deposit",
          sytemap: estate.sytemap || "",
          amenities: estate.amenities || [],
          neighborhood: estate.neighborhood || [],
          paymentPlan: estate.paymentPlan || [],
          videos: estate.videos || [],
        }
      : { ...EMPTY_FORM },
  );

  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(isEdit ? estate.img : null);
  const [galleryItems, setGalleryItems] = useState(
    isEdit
      ? (estate.gallery || []).map((g) => ({
          url: g.url || g,
          publicId: g.publicId || null,
          isExisting: true,
        }))
      : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files);
    setGalleryItems((prev) =>
      [
        ...prev,
        ...files.map((f) => ({
          url: URL.createObjectURL(f),
          file: f,
          isExisting: false,
        })),
      ].slice(0, 15),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      const existingGallery = galleryItems.filter((g) => g.isExisting);
      const newGalleryFiles = galleryItems.filter(
        (g) => !g.isExisting && g.file,
      );
      const payload = {
        ...form,
        gallery: existingGallery.map((g) => ({
          url: g.url,
          publicId: g.publicId,
        })),
      };
      fd.append("data", JSON.stringify(payload));
      if (imgFile) fd.append("img", imgFile);
      newGalleryFiles.forEach((g) => fd.append("gallery", g.file));
      if (isEdit) await updateEstate(estate._id, fd);
      else await createEstate(fd);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 14,
    border: "1.5px solid rgba(112,12,235,0.15)",
    background: "#fafafa",
    outline: "none",
    color: "#0f0a1e",
    fontWeight: 500,
  };
  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };

  const SectionLabel = ({ children }) => (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#700CEB",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(112,12,235,0.1)" }} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9997] flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: "rgba(8,4,20,0.8)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl mb-8"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-8 py-6 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#3F0C91,#700CEB)" }}
        >
          <div>
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              {isEdit ? "Edit Estate" : "Add New Estate"}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {isEdit
                ? `Editing: ${estate.estate}`
                : "Complete all required fields"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#dc2626" }} />
              <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 500 }}>
                {error}
              </p>
            </div>
          )}

          <SectionLabel>Images</SectionLabel>
          <ImageUploadZone
            label="Featured / Banner Image"
            preview={imgPreview}
            onChange={handleImgChange}
            required={!isEdit}
            hint="Displayed as hero banner — 1200×800 recommended"
          />
          <GalleryUploadZone
            previews={galleryItems}
            onAdd={handleGalleryAdd}
            onRemove={(i) =>
              setGalleryItems((prev) => prev.filter((_, idx) => idx !== i))
            }
          />

          <SectionLabel>Estate Details</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Estate Name *",
                field: "estate",
                placeholder: "e.g. Kings Ocean View",
              },
              {
                label: "Address *",
                field: "address",
                placeholder: "e.g. Off Monastery Road",
              },
              {
                label: "Price *",
                field: "price",
                placeholder: "e.g. 40,000,000",
              },
              { label: "Size *", field: "sqm", placeholder: "e.g. 500sqm" },
              {
                label: "Deposit",
                field: "depositPercentage",
                placeholder: "30% Initial Deposit",
              },
              {
                label: "Site Map URL",
                field: "sytemap",
                placeholder: "https://...",
              },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <input
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={placeholder}
                  required={["estate", "address", "price", "sqm"].includes(
                    field,
                  )}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Location", field: "location", options: LOCATIONS },
              { label: "Purpose", field: "purpose", options: PURPOSES },
              { label: "Title", field: "title", options: TITLES },
              { label: "Category", field: "category", options: CATEGORIES },
            ].map(({ label, field, options }) => (
              <div key={field} className="relative">
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <div className="relative">
                  <select
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    style={selectStyle}
                  >
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#9ca3af" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Description *
            </label>
            <textarea
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
              placeholder="Describe the estate in detail..."
              rows={4}
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
          </div>

          <SectionLabel>Videos</SectionLabel>
          <VideosEditor
            videos={form.videos}
            onChange={(v) => set("videos", v)}
          />

          <SectionLabel>Property Data</SectionLabel>
          <ListEditor
            label="Amenities"
            items={form.amenities}
            onChange={(v) => set("amenities", v)}
            placeholder="e.g. Swimming Pool"
          />
          <ListEditor
            label="Neighborhood"
            items={form.neighborhood}
            onChange={(v) => set("neighborhood", v)}
            placeholder="e.g. Shoprite Sangotedo"
          />
          <PaymentPlanEditor
            plans={form.paymentPlan}
            onChange={(v) => set("paymentPlan", v)}
          />

          <div
            className="flex gap-3 pt-2 border-t"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: "#f3f4f6", color: "#374151" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
                color: "#fff",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Update Estate"
              ) : (
                "Create Estate"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Estate Card ───────────────────────────────────────────────────────────────
function EstateRow({ estate, onEdit, onDelete, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const style = PURPOSE_STYLE[estate.purpose] || PURPOSE_STYLE.Investment;
  const PurposeIcon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "rgba(112,12,235,0.2)" : "rgba(0,0,0,0.06)"}`,
        boxShadow: hovered
          ? "0 20px 60px rgba(112,12,235,0.1), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.35s ease, border-color 0.35s ease",
        opacity: estate.isActive ? 1 : 0.6,
      }}
    >
      {/* Inactive ribbon */}
      {!estate.isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(to right, #dc2626, transparent)",
          }}
        />
      )}

      <div className="flex items-stretch">
        {/* ── Image panel ── */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ width: 160 }}
        >
          <motion.img
            src={estate.img}
            alt={estate.estate}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ minHeight: 140 }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.18) 0%, transparent 60%)",
            }}
          />

          {/* Status pill */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: estate.isActive ? "#34d399" : "#f87171" }}
            />
            <span
              style={{
                fontSize: 9,
                color: "#fff",
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              {estate.isActive ? "LIVE" : "OFF"}
            </span>
          </div>

          {/* Gallery count */}
          {estate.gallery?.length > 0 && (
            <div
              className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(6px)",
              }}
            >
              <LayoutGrid size={9} style={{ color: "rgba(255,255,255,0.8)" }} />
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                }}
              >
                {estate.gallery.length}
              </span>
            </div>
          )}
        </div>

        {/* ── Content panel ── */}
        <div className="flex-1 min-w-0 p-5 flex flex-col justify-between">
          <div>
            {/* Top row: name + purpose badge */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#0f0a1e",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                  }}
                  className="truncate"
                >
                  {estate.estate}
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin
                    size={11}
                    style={{ color: "#700CEB", flexShrink: 0 }}
                  />
                  <span
                    style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}
                    className="truncate"
                  >
                    {estate.address}
                  </span>
                </div>
              </div>

              {/* Purpose badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0"
                style={{
                  background: style.bg,
                  border: `1px solid ${style.color}22`,
                }}
              >
                <PurposeIcon size={11} style={{ color: style.color }} />
                <span
                  style={{ fontSize: 11, color: style.color, fontWeight: 700 }}
                >
                  {estate.purpose}
                </span>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                {estate.title}
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                {estate.location}
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: "#f3f4f6", color: "#6b7280" }}
              >
                {estate.sqm}
              </span>
              {estate.videos?.length > 0 && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    color: "#dc2626",
                  }}
                >
                  <Youtube size={10} /> {estate.videos.length} video
                  {estate.videos.length > 1 ? "s" : ""}
                </span>
              )}
              {!estate.isActive && (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    color: "#dc2626",
                  }}
                >
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Bottom row: price + actions */}
          <div
            className="flex items-center justify-between mt-4 pt-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
          >
            {/* Price */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Starting from
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#0f0a1e",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                }}
              >
                ₦{estate.price}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Toggle */}
              <motion.button
                onClick={() => onToggle(estate)}
                whileTap={{ scale: 0.92 }}
                title={estate.isActive ? "Deactivate" : "Activate"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: estate.isActive
                    ? "rgba(5,150,105,0.08)"
                    : "rgba(220,38,38,0.08)",
                  color: estate.isActive ? "#059669" : "#dc2626",
                  border: `1px solid ${estate.isActive ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                }}
              >
                {estate.isActive ? (
                  <>
                    <EyeOff size={13} /> Hide
                  </>
                ) : (
                  <>
                    <Eye size={13} /> Show
                  </>
                )}
              </motion.button>

              {/* Edit */}
              <motion.button
                onClick={() => onEdit(estate)}
                whileTap={{ scale: 0.92 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: "rgba(112,12,235,0.08)",
                  color: "#700CEB",
                  border: "1px solid rgba(112,12,235,0.15)",
                }}
              >
                <Pencil size={13} /> Edit
              </motion.button>

              {/* Delete */}
              <motion.button
                onClick={() => onDelete(estate)}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  color: "#dc2626",
                  border: "1px solid rgba(220,38,38,0.15)",
                }}
              >
                <Trash2 size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Accent bar on right edge ── */}
        <div
          className="w-1 shrink-0 transition-all duration-300"
          style={{
            background: hovered
              ? `linear-gradient(to bottom, ${style.color}, transparent)`
              : "transparent",
          }}
        />
      </div>
    </motion.div>
  );
}

// ── ManageEstates ─────────────────────────────────────────────────────────────
export default function ManageEstates() {
  const [estates, setEstates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEstate, setEditingEstate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(filterLocation && { location: filterLocation }),
        ...(filterPurpose && { purpose: filterPurpose }),
        ...(showAll && { active: "all" }),
      };
      const data = await fetchEstates(params);
      setEstates(data.estates);
      setTotal(data.total);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterLocation, filterPurpose, showAll]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = () => {
    showToast(editingEstate ? "Estate updated!" : "Estate created!");
    load();
  };
  const handleDelete = async () => {
    try {
      await deleteEstate(deleteTarget._id);
      showToast("Estate deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const handleToggle = async (estate) => {
    try {
      const res = await toggleEstate(estate._id);
      showToast(`Estate ${res.isActive ? "activated" : "deactivated"}`);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 mt-2">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            message={`This will permanently delete "${deleteTarget.estate}" and all its Cloudinary assets.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showForm && (
          <EstateFormModal
            estate={editingEstate}
            onClose={() => {
              setShowForm(false);
              setEditingEstate(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#0f0a1e",
              letterSpacing: "-0.04em",
            }}
          >
            Manage Estates
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
            {total} estate{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEstate(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
          style={{
            background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(112,12,235,0.3)",
          }}
        >
          <Plus size={16} /> Add Estate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
          style={{
            background: "#fff",
            border: "1.5px solid rgba(112,12,235,0.12)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Search size={15} style={{ color: "#700CEB" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search estates..."
            className="outline-none bg-transparent text-sm flex-1"
            style={{ color: "#0f0a1e" }}
          />
        </div>
        {[
          {
            value: filterLocation,
            set: (v) => {
              setFilterLocation(v);
              setPage(1);
            },
            options: LOCATIONS,
            placeholder: "All Locations",
          },
          {
            value: filterPurpose,
            set: (v) => {
              setFilterPurpose(v);
              setPage(1);
            },
            options: PURPOSES,
            placeholder: "All Purposes",
          },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="pl-4 pr-8 py-2.5 rounded-xl text-sm font-semibold outline-none appearance-none"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(112,12,235,0.12)",
                color: f.value ? "#700CEB" : "#6b7280",
                cursor: "pointer",
              }}
            >
              <option value="">{f.placeholder}</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#9ca3af" }}
            />
          </div>
        ))}
        <button
          onClick={() => {
            setShowAll(!showAll);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: showAll ? "rgba(112,12,235,0.1)" : "#fff",
            color: showAll ? "#700CEB" : "#6b7280",
            border: "1.5px solid rgba(112,12,235,0.12)",
          }}
        >
          {showAll ? "Active Only" : "Show All"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2
            size={32}
            style={{ color: "#700CEB" }}
            className="animate-spin"
          />
        </div>
      ) : estates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(112,12,235,0.08)" }}
          >
            <Building2 size={28} style={{ color: "#700CEB" }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0f0a1e" }}>
            No estates found
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>
            Add your first estate or adjust the filters.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {estates.map((estate, index) => (
              <EstateRow
                key={estate._id}
                estate={estate}
                index={index}
                onEdit={(e) => {
                  setEditingEstate(e);
                  setShowForm(true);
                }}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-between pt-2">
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(112,12,235,0.12)",
                color: "#700CEB",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "#700CEB", color: "#fff" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
