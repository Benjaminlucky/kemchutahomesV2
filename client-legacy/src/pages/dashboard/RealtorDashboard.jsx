import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const defaultAvatar =
  "https://ui-avatars.com/api/?name=Realtor&background=700CEB&color=fff";

export default function RealtorDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recruits, setRecruits] = useState([]);
  const [recruitsLoading, setRecruitsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${BASE_URL}/api/realtors/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setError(
            err.response?.data?.message || "Failed to load dashboard data",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchRecruits = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setRecruitsLoading(true);
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${BASE_URL}/api/realtors/my-recruits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecruits(res.data.recruits || []);
      } catch (err) {
        console.error("Failed to load recruits:", err);
      } finally {
        setRecruitsLoading(false);
      }
    };

    if (data) fetchRecruits();
  }, [data]);

  const handleCopy = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerFile = () => fileInputRef.current?.click();

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const token = localStorage.getItem("token");
    try {
      setUploading(true);
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(`${BASE_URL}/api/realtors/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.avatar) {
        setData((prev) => ({ ...prev, avatar: res.data.avatar }));
      }
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-customBlack-800 font-sans selection:bg-customPurple-100 selection:text-customPurple-900">
      {/* Dynamic Background Blur Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-customPurple-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-customPurple-50 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-customBlack-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-customBlack-900">
              Realtor<span className="text-customPurple-500">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-customBlack-900">
                {fullName}
              </p>
              <p className="text-xs text-customPurple-600 font-medium">
                Verified Realtor
              </p>
            </div>
            <div className="relative group">
              <img
                src={data.avatar || defaultAvatar}
                className="w-10 h-10 rounded-full ring-2 ring-customPurple-500 ring-offset-2 cursor-pointer transition-transform hover:scale-105"
                alt="Profile"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-customBlack-900">
            Welcome Back,{" "}
            <span className="text-customPurple-600">{data.firstName}</span>!
          </h2>
          <p className="text-customBlack-500 mt-2 font-medium">
            Monitor your growth and network performance in real-time.
          </p>
        </div>

        {/* Action & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Profile Card (Actionable) */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-customBlack-100 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-customPurple-50/50 transition-all duration-500 animate-fadeIn">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <img
                  src={data.avatar || defaultAvatar}
                  className="w-full h-full object-cover"
                  alt="User"
                />
              </div>
              <button
                onClick={triggerFile}
                className="absolute -bottom-2 -right-2 bg-customPurple-500 text-white p-2 rounded-xl shadow-lg hover:bg-customPurple-600 transition-colors"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <CameraIcon />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={onFileSelect}
                className="hidden"
                accept="image/*"
              />
            </div>
            <h3 className="text-lg font-bold text-customBlack-900 line-clamp-1">
              {fullName}
            </h3>
            <span className="inline-block px-3 py-1 bg-customPurple-50 text-customPurple-700 text-xs font-bold rounded-full mt-2 uppercase tracking-wider">
              Network Leader
            </span>
          </div>

          <StatCard
            label="Total Downlines"
            value={data.downlines || 0}
            icon={<UsersIcon />}
            color="text-customPurple-600"
            delay="100"
          />

          <StatCard
            label="Recruited By"
            value={data.recruitedBy || "None"}
            icon={<ShieldIcon />}
            color="text-blue-600"
            delay="200"
          />

          {/* Share Link Card */}
          <div
            onClick={handleCopy}
            className="group relative bg-customBlack-900 rounded-3xl p-6 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: "300ms" }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShareIcon size={80} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4">
                <LinkIcon />
              </div>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                  Referral Link
                </p>
                <p className="text-white font-mono text-sm truncate opacity-90">
                  {data.referralLink}
                </p>
              </div>
            </div>
            {copied && (
              <div className="absolute inset-0 bg-customPurple-500 flex items-center justify-center text-white font-bold animate-fadeIn">
                Copied Successfully!
              </div>
            )}
          </div>
        </div>

        {/* Recruits Section */}
        <section className="animate-fadeIn" style={{ animationDelay: "400ms" }}>
          <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
            <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
              <div>
                <h3 className="text-2xl font-bold text-customBlack-900">
                  Direct Network
                </h3>
                <p className="text-customBlack-400 font-medium">
                  Managing your personal recruits
                </p>
              </div>
              <div className="bg-customBlack-50 rounded-2xl p-2 flex items-center gap-2">
                <span className="bg-white px-4 py-1.5 rounded-xl text-customPurple-600 font-black shadow-sm">
                  {recruits.length}
                </span>
                <span className="text-sm font-bold text-customBlack-500 pr-3 uppercase">
                  Total Recruits
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest">
                      Realtor
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest hidden md:table-cell">
                      Contact
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest">
                      ID Code
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest text-right">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {recruits.length > 0 ? (
                    recruits.map((recruit, idx) => (
                      <tr
                        key={recruit._id}
                        className="group hover:bg-customPurple-50/30 transition-colors animate-tableRowFadeIn"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={recruit.avatar || defaultAvatar}
                              className="w-10 h-10 rounded-xl object-cover"
                              alt="Recruit"
                            />
                            <div>
                              <p className="font-bold text-customBlack-900">
                                {recruit.firstName} {recruit.lastName}
                              </p>
                              <p className="text-xs text-customBlack-400 md:hidden">
                                {recruit.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 hidden md:table-cell">
                          <p className="text-sm font-medium text-customBlack-600">
                            {recruit.email}
                          </p>
                          <p className="text-xs text-customBlack-400">
                            {recruit.phone}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-mono text-xs font-bold bg-customBlack-100 text-customBlack-700 px-2 py-1 rounded-md">
                            {recruit.referralCode}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-medium text-customBlack-500">
                          {new Date(recruit.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="max-w-xs mx-auto opacity-40">
                          <UsersIcon size={48} className="mx-auto mb-4" />
                          <p className="font-bold">No recruits found yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tableRowFadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-tableRowFadeIn {
          animation: tableRowFadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color, delay }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-sm border border-customBlack-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-customBlack-400 text-xs font-bold uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-customBlack-900 truncate">
          {value}
        </p>
      </div>
      <div className="mt-4 h-1 w-full bg-customBlack-50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-customPurple-500 w-0 group-hover:w-full transition-all duration-1000 ease-out`}
        />
      </div>
    </div>
  );
}

// Icons (SVG Components)
const CameraIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
  >
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const UsersIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
  </svg>
);
const ShieldIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const LinkIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
const ShareIcon = ({ size }) => (
  <svg
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
    className="opacity-10"
  >
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-customPurple-100 border-t-customPurple-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-customBlack-400 font-bold tracking-widest uppercase text-xs">
          Syncing Data...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm text-center">
        <div className="text-red-500 mb-4 inline-block bg-red-50 p-4 rounded-full">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-customBlack-900 mb-2">
          Access Error
        </h2>
        <p className="text-customBlack-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-customBlack-900 text-white py-3 rounded-2xl font-bold hover:bg-customBlack-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
