"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "../../components/ProfileDropdown";
import RouteGuard from "../../components/RouteGuard";

type OrderTask = {
  id: number;
  status: string;
  serviceType: string;
  itemsDescription: string;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupLandmark?: string;
  pickupDate?: string;
  specialNote?: string;
  verificationCode?: string;
  createdAt: string;
  customer: { name: string; phone?: string; email: string };
  store?: { name: string; address: string };
};

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  PENDING:            { label: "Pending Pickup", style: "bg-amber-100 text-amber-800 font-bold" },
  PENDING_PICKUP:     { label: "Pending Pickup", style: "bg-amber-100 text-amber-800 font-bold" },
  RIDER_ASSIGNED:     { label: "En Route",        style: "bg-sky-100 text-sky-800 font-bold" },
  PICKED_UP:          { label: "Picked Up",       style: "bg-purple-100 text-purple-800 font-bold" },
  RECEIVED_AT_STORE:  { label: "Received at Store", style: "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" },
  IN_WASHING:         { label: "In Washing",      style: "bg-indigo-100 text-indigo-800 font-bold" },
  IN_LAUNDRY:         { label: "In Washing",      style: "bg-indigo-100 text-indigo-800 font-bold" },
  READY_FOR_DELIVERY: { label: "Out for Delivery",style: "bg-teal-100 text-teal-800 font-bold" },
  DELIVERED:          { label: "Delivered",       style: "bg-emerald-100 text-emerald-800 font-bold" },
};

function RiderDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderTask[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [verificationCodeInputs, setVerificationCodeInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (user && (user.role === "RIDER" || user.role === "ADMIN")) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setFetching(true);
    try {
      const res = await fetch("https://washing-3ntw.onrender.com/api/orders/rider/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (id: number, status: string, code?: string) => {
    if ((status === "DELIVERED" || status === "PICKED_UP") && (!code || code.length !== 4)) {
      alert("Please enter the 4-digit verification code provided by the customer.");
      return;
    }
    
    setUpdatingId(id);
    try {
      const res = await fetch(`https://washing-3ntw.onrender.com/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status, verificationCode: code }),
      });
      if (res.ok) {
        if (status === "DELIVERED") {
          setVerificationCodeInputs(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
        fetchOrders();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update status");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading rider tasks…</p>
        </div>
      </div>
    );
  }

  const activePickups = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");

  return (
    <div className="min-h-screen bg-[#f8fafb] text-gray-900 font-sans">
      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center h-[72px]">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <img src="/logo.png" alt="Washington Laundrettes" className="h-[48px] md:h-[52px] w-auto object-contain" />
            <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider hidden sm:inline-block">
              Rider Portal
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {user.name}
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#004d64] via-[#006684] to-[#016684] text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-sky-200 uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">near_me</span>
              Direct Routing Dispatch Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Rider Pickup Tasks</h1>
            <p className="text-sky-100 text-xs md:text-sm max-w-lg">
              Assigned pickup routes automatically matched to your Washington Laundrettes hub.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-center w-full md:w-auto min-w-[140px]">
            <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Active Tasks</span>
            <span className="text-3xl font-black">{activePickups.length}</span>
          </div>
        </div>

        {/* Tasks Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">two_wheeler</span>
              Assigned Store Tasks ({orders.length})
            </h2>
            <button onClick={fetchOrders} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-base">refresh</span>
              Refresh Tasks
            </button>
          </div>

          {fetching ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-sm">
              Loading tasks…
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-gray-300">task</span>
              <p className="text-gray-600 font-semibold text-sm">No pickup tasks available for your store hub right now.</p>
              <p className="text-gray-400 text-xs">New direct-routing orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => {
                const badge = STATUS_BADGES[o.status] || { label: o.status, style: "bg-gray-100 text-gray-800" };
                const hasCoordinates = Boolean(o.pickupLatitude && o.pickupLongitude);
                const navUrl = hasCoordinates
                  ? `https://www.google.com/maps/dir/?api=1&destination=${o.pickupLatitude},${o.pickupLongitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.pickupAddress)}`;

                return (
                  <div
                    key={o.id}
                    className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary text-base">#{String(o.id).padStart(4, "0")}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {o.serviceType || "Laundry"}
                          </span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${badge.style}`}>{badge.label}</span>
                      </div>

                      {/* Customer info */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">{o.customer.name}</span>
                          {o.customer.phone && (
                            <a href={`tel:${o.customer.phone}`} className="text-primary font-bold hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">call</span>
                              {o.customer.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-gray-600 truncate">{o.pickupAddress}</p>
                        {o.pickupLandmark && (
                          <p className="text-emerald-700 font-semibold text-[11px]">📍 Landmark: {o.pickupLandmark}</p>
                        )}
                        {o.store && (
                          <p className="text-gray-400 text-[11px]">Hub: <strong className="text-gray-700">{o.store.name}</strong></p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/rider/orders/${o.id}`}
                        className="flex-1 bg-gray-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center hover:bg-gray-800 transition-all"
                      >
                        View &amp; Navigate →
                      </Link>

                      <a
                        href={navUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-sky-600 text-white text-xs font-bold p-2.5 rounded-xl hover:bg-sky-700 transition-all flex items-center justify-center"
                        title="Start Google Maps Navigation"
                      >
                        <span className="material-symbols-outlined text-base">navigation</span>
                      </a>

                      {(o.status === "PENDING" || o.status === "PENDING_PICKUP") && (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Code"
                            value={verificationCodeInputs[o.id] || ""}
                            onChange={(e) => setVerificationCodeInputs({ ...verificationCodeInputs, [o.id]: e.target.value.replace(/\D/g, '') })}
                            className="w-16 text-center border border-gray-300 rounded-xl py-2 text-sm font-mono font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => updateStatus(o.id, "PICKED_UP", verificationCodeInputs[o.id])}
                            disabled={updatingId === o.id || (verificationCodeInputs[o.id]?.length !== 4)}
                            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                          >
                            Confirm Pickup
                          </button>
                        </div>
                      )}

                      {o.status === "PICKED_UP" && (
                        <div className="flex-1 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-800 uppercase">Hub Drop-off Code</span>
                          <span className="font-mono text-lg font-black text-purple-700 tracking-widest">{o.verificationCode || "----"}</span>
                        </div>
                      )}

                      {o.status === "READY_FOR_DELIVERY" && (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Code"
                            value={verificationCodeInputs[o.id] || ""}
                            onChange={(e) => setVerificationCodeInputs({ ...verificationCodeInputs, [o.id]: e.target.value.replace(/\D/g, '') })}
                            className="w-16 text-center border border-gray-300 rounded-xl py-2 text-sm font-mono font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => updateStatus(o.id, "DELIVERED", verificationCodeInputs[o.id])}
                            disabled={updatingId === o.id || (verificationCodeInputs[o.id]?.length !== 4)}
                            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                          >
                            Mark Delivered
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function RiderDashboardPage() {
  return (
    <RouteGuard allowedRoles={["RIDER", "ADMIN"]}>
      <RiderDashboard />
    </RouteGuard>
  );
}
