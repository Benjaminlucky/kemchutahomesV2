"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  X,
  Eye,
  Edit2,
  Trash2,
  Download,
  ExternalLink,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Hash,
  CheckCircle2,
} from "lucide-react";
import useSWR from "swr";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch");
    }
    return res.json();
  });

// Toast Component
const Toast = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -20, x: "-50%" }}
      className="fixed top-6 left-1/2 z-[100] bg-white shadow-2xl rounded-xl px-6 py-4 flex items-center gap-3 border border-green-200"
    >
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="text-green-600" size={20} />
      </div>
      <div>
        <p className="font-semibold text-gray-800">Success!</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={16} className="text-gray-500" />
      </button>
    </motion.div>
  );
};

export default function ManageRealtors() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({});

  const { data, error, mutate } = useSWR(
    `${API_URL}/api/realtors?page=${page}&limit=${limit}&search=${encodeURIComponent(
      search,
    )}&sort=${sort}`,
    (url) => fetcher(url, token),
    { revalidateOnFocus: false },
  );

  const loading = !data && !error;
  const realtors = data?.docs || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const goTo = (p) => {
    if (!data) return;
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  };

  const handleSearch = () => {
    setPage(1);
    mutate();
  };

  const handleSortChange = (field) => {
    setSort((prev) => (prev === field ? `-${field}` : field));
    setPage(1);
  };

  // View realtor details
  const handleView = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const realtor = await res.json();
      setViewModal(realtor);
    } catch (err) {
      alert("Failed to fetch realtor details");
    }
  };

  // Open edit modal
  const handleEditOpen = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const realtor = await res.json();
      setEditForm(realtor);
      setEditModal(realtor);
    } catch (err) {
      alert("Failed to fetch realtor details");
    }
  };

  // Save edit
  const handleEditSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${editModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");

      setToast("Realtor updated successfully");
      setEditModal(null);
      mutate();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete realtor
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${deleteModal._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setToast("Realtor deleted successfully");
      setDeleteModal(null);
      mutate();
    } catch (err) {
      alert(err.message);
    }
  };

  // Export emails
  const handleExportEmails = () => {
    const emails = realtors.map((r) => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    setToast("Emails copied to clipboard!");
  };

  // Export phone numbers
  const handleExportPhones = () => {
    const phones = realtors.map((r) => r.phone).join(", ");
    navigator.clipboard.writeText(phones);
    setToast("Phone numbers copied to clipboard!");
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-customPurple-700">
          Manage Realtors
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportEmails}
            className="px-5 py-2.5 bg-gradient-to-r from-customPurple-600 to-customPurple-700 text-white rounded-lg hover:from-customPurple-700 hover:to-customPurple-800 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Download size={16} />
            Export Emails
          </button>
          <button
            onClick={handleExportPhones}
            className="px-5 py-2.5 bg-gradient-to-r from-customBlack-800 to-customBlack-900 text-white rounded-lg hover:from-customBlack-900 hover:to-black flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Download size={16} />
            Export Phones
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name, email, referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="px-4 py-3 border border-gray-300 rounded-lg w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-customPurple-400 focus:border-customPurple-400 transition-all shadow-sm"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="px-5 py-3 bg-customPurple-600 text-white rounded-lg hover:bg-customPurple-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            Search
          </button>
          <select
            value={sort.replace("-", "")}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customPurple-400 focus:border-customPurple-400 transition-all shadow-sm font-medium"
          >
            <option value="createdAt">Created At</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="referralCode">Referral Code</option>
          </select>
        </div>
      </div>

      {/* Realtors table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              All Realtors
            </h3>
            <div className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              {loading ? "Loading..." : `${total} total`}
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            {error.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-customPurple-600" />
                    ID
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-customPurple-600" />
                    First Name
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-customPurple-600" />
                    Last Name
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-customPurple-600" />
                    Email
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-customPurple-600" />
                    Phone
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-customPurple-600" />
                    Bank
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-customPurple-600" />
                    Account No.
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="px-4 py-4">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : realtors.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <User size={48} className="text-gray-300" />
                      <p className="font-medium">No realtors found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                realtors.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-gradient-to-r hover:from-customPurple-50 hover:to-purple-50 transition-all duration-200 cursor-pointer"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-800">
                      {r.referralCode || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                      {r.name?.split(" ")[0] || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                      {r.name?.split(" ")[1] || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.email || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.bank || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.accountNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(r._id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-customPurple-600 bg-customPurple-50 hover:bg-customPurple-100 hover:shadow-md rounded-lg transition-all duration-200 font-medium"
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span className="text-xs">View</span>
                        </button>
                        <button
                          onClick={() => handleEditOpen(r._id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-customBlack-700 bg-customBlack-100 hover:bg-customBlack-200 hover:shadow-md rounded-lg transition-all duration-200 font-medium"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteModal(r)}
                          className="flex items-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-md rounded-lg transition-all duration-200 font-medium"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">
              Page {page} of {pages} — {total} total
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-customPurple-50 hover:border-customPurple-300 hover:text-customPurple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 font-medium shadow-sm"
              >
                Prev
              </button>
              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= pages || loading}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-customPurple-50 hover:border-customPurple-300 hover:text-customPurple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 font-medium shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-customPurple-600 to-customPurple-700 px-6 py-5 flex items-center justify-between shadow-md z-10">
                <h3 className="text-xl font-bold text-white">
                  Realtor Details
                </h3>
                <button
                  onClick={() => setViewModal(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={
                        viewModal.avatar ||
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-customPurple-200 shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="First Name" value={viewModal.firstName} />
                  <DetailItem label="Last Name" value={viewModal.lastName} />
                  <DetailItem label="Email" value={viewModal.email} />
                  <DetailItem label="Phone" value={viewModal.phone} />
                  <DetailItem
                    label="Birth Date"
                    value={
                      viewModal.birthDate
                        ? new Date(viewModal.birthDate).toLocaleDateString()
                        : "-"
                    }
                  />
                  <DetailItem label="State" value={viewModal.state} />
                  <DetailItem label="Bank" value={viewModal.bank} />
                  <DetailItem
                    label="Account Name"
                    value={viewModal.accountName}
                  />
                  <DetailItem
                    label="Account Number"
                    value={viewModal.accountNumber}
                  />
                  <DetailItem
                    label="Referral Code"
                    value={viewModal.referralCode}
                  />
                  <DetailItem
                    label="Recruited By"
                    value={viewModal.recruitedByName || "Direct"}
                  />
                  <DetailItem
                    label="Created At"
                    value={
                      viewModal.createdAt
                        ? new Date(viewModal.createdAt).toLocaleString()
                        : "-"
                    }
                  />
                </div>

                {/* Referral Link */}
                <div className="border-t pt-6">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ExternalLink size={16} className="text-customPurple-600" />
                    Referral Link
                  </label>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={`https://kemchutahomesltd.com/signup?ref=${viewModal.referralCode}`}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <a
                      href={`https://kemchutahomesltd.com/signup?ref=${viewModal.referralCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 text-white bg-customPurple-600 hover:bg-customPurple-700 rounded-lg transition-colors shadow-md"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-customPurple-600 to-customPurple-700 px-6 py-5 flex items-center justify-between shadow-md z-10">
                <h3 className="text-xl font-bold text-white">Edit Realtor</h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    value={editForm.firstName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                  <FormField
                    label="Last Name"
                    value={editForm.lastName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                  <FormField
                    label="Phone"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                  <FormField
                    label="State"
                    value={editForm.state || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, state: e.target.value })
                    }
                  />
                  <FormField
                    label="Bank"
                    value={editForm.bank || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bank: e.target.value })
                    }
                  />
                  <FormField
                    label="Account Name"
                    value={editForm.accountName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, accountName: e.target.value })
                    }
                  />
                  <FormField
                    label="Account Number"
                    value={editForm.accountNumber || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setEditModal(null)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-6 py-2.5 bg-gradient-to-r from-customPurple-600 to-customPurple-700 text-white rounded-lg hover:from-customPurple-700 hover:to-customPurple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={28} />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 text-center mt-4">
                  Delete Realtor?
                </h3>
                <p className="text-gray-600 text-center mt-3 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    {deleteModal.firstName} {deleteModal.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {label}
    </label>
    <p className="text-gray-900 mt-2 font-medium">{value || "-"}</p>
  </div>
);

const FormField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-customPurple-500 focus:border-customPurple-500 transition-all shadow-sm"
    />
  </div>
);
