const BASE = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Public ─────────────────────────────────────────────────────────────────
export const fetchEstates = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/estates?${q}`);
  if (!res.ok) throw new Error("Failed to fetch estates");
  return res.json();
};

export const fetchEstateBySlug = async (slug) => {
  const res = await fetch(`${BASE}/api/estates/slug/${slug}`);
  if (!res.ok) throw new Error("Estate not found");
  return res.json();
};

export const fetchEstateById = async (id) => {
  const res = await fetch(`${BASE}/api/estates/id/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Estate not found");
  return res.json();
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const createEstate = async (formData) => {
  const res = await fetch(`${BASE}/api/estates`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create estate");
  return data;
};

export const updateEstate = async (id, formData) => {
  const res = await fetch(`${BASE}/api/estates/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update estate");
  return data;
};

export const deleteEstate = async (id) => {
  const res = await fetch(`${BASE}/api/estates/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete estate");
  return data;
};

export const toggleEstate = async (id) => {
  const res = await fetch(`${BASE}/api/estates/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteGalleryImage = async (estateId, publicId) => {
  const res = await fetch(
    `${BASE}/api/estates/${estateId}/gallery/${encodeURIComponent(publicId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ── Inspection ──────────────────────────────────────────────────────────────
export const bookInspection = async (payload) => {
  const res = await fetch(`${BASE}/api/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to book inspection.");
  return data;
};

// ── Buy2Sell ──────────────────────────────────────────────────────────────────

export const fetchROISettings = async () => {
  const res = await fetch(`${BASE}/api/buy2sell/roi`);
  if (!res.ok) throw new Error("Failed to fetch ROI settings");
  return res.json();
};

export const submitBuy2SellLead = async (payload) => {
  const res = await fetch(`${BASE}/api/buy2sell/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit enquiry");
  return data;
};
