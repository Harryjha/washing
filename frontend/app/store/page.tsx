"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import RouteGuard from "../../components/RouteGuard";

type OrderItem = {
  id: number;
  status: string;
  serviceType: string;
  itemsDescription: string;
  pickupAddress: string;
  pickupDate?: string;
  createdAt: string;
  customer: { id: number; name: string; email: string; phone?: string; address?: string };
  rider?: { id: number; name: string; email: string; phone?: string };
  store?: { id: string; name: string; address: string };
  verificationCode?: string;
};

type StoreRider = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count?: { deliveries: number };
};

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  PENDING:            { label: "Pending", style: "bg-gray-100 text-gray-700 border-gray-200" },
  PENDING_PICKUP:     { label: "Pending Pickup", style: "bg-amber-100 text-amber-800 border-amber-200" },
  RIDER_ASSIGNED:     { label: "Rider En Route", style: "bg-blue-100 text-blue-800 border-blue-200" },
  PICKED_UP:          { label: "Picked Up by Rider", style: "bg-purple-100 text-purple-800 border-purple-200" },
  RECEIVED_AT_STORE:  { label: "Received at Store Hub", style: "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold" },
  IN_LAUNDRY:         { label: "In Washing / Laundry", style: "bg-sky-100 text-sky-800 border-sky-200" },
  IN_WASHING:         { label: "In Washing", style: "bg-sky-100 text-sky-800 border-sky-200" },
  READY_FOR_DELIVERY: { label: "Ready for Delivery", style: "bg-teal-100 text-teal-800 border-teal-200" },
  DELIVERED:          { label: "Delivered & Complete", style: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED:          { label: "Cancelled", style: "bg-red-100 text-red-800 border-red-200" },
};

function StoreAdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [riders, setRiders] = useState<StoreRider[]>([]);
  const [fetching, setFetching] = useState(true);

  const [activeTab, setActiveTab] = useState<"orders" | "riders">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [verificationCodeInputs, setVerificationCodeInputs] = useState<Record<number, string>>({});
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    if (user && (user.role === "STORE_ADMIN" || user.role === "ADMIN")) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch store info
      const infoRes = await fetch("https://washing-3ntw.onrender.com/api/store/info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        setStoreInfo(infoData.store);
      }

      // Fetch store orders
      const ordersRes = await fetch("https://washing-3ntw.onrender.com/api/store/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Fetch store riders
      const ridersRes = await fetch("https://washing-3ntw.onrender.com/api/store/riders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ridersRes.ok) {
        const ridersData = await ridersRes.json();
        setRiders(ridersData);
      }
    } catch (err) {
      console.error("Error loading store admin data:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleConfirmReceive = async (orderId: number) => {
    const code = verificationCodeInputs[orderId];
    if (!code || code.length !== 4) {
      alert("Please enter the 4-digit verification code provided by the rider.");
      return;
    }
    
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://washing-3ntw.onrender.com/api/store/orders/${orderId}/receive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationCode: code }),
      });

      if (res.ok) {
        setVerificationCodeInputs(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        // Refresh orders list
        await loadData();
      } else {
        alert("Failed to confirm order receipt.");
      }
    } catch (err) {
      console.error("Error receiving order:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkReady = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://washing-3ntw.onrender.com/api/store/orders/${orderId}/ready`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Failed to mark order as ready.");
      }
    } catch (err) {
      console.error("Error marking ready:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading Store Hub Portal…</p>
        </div>
      </div>
    );
  }

  const pendingReceiptCount = orders.filter((o) => o.status === "PICKED_UP").length;
  const receivedAtStoreCount = orders.filter((o) => o.status === "RECEIVED_AT_STORE").length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PICKED_UP") return o.status === "PICKED_UP";
    if (statusFilter === "RECEIVED_AT_STORE") return o.status === "RECEIVED_AT_STORE";
    if (statusFilter === "COMPLETED") return o.status === "DELIVERED";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <span className="material-symbols-outlined text-xl md:text-2xl">store</span>
            </div>
            <div>
              <div className="flex items-center gap-1 md:gap-2">
                <h1 className="text-sm md:text-lg font-bold text-slate-900 line-clamp-1">{storeInfo?.name || "Store Hub Portal"}</h1>
                <span className="bg-indigo-50 text-indigo-700 text-[9px] md:text-xs font-extrabold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider hidden sm:inline-block">
                  Store Admin
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 truncate max-w-[120px] md:max-w-md hidden sm:block">{storeInfo?.address || "Branch Store Operations"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3.5 py-1.5 md:py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm md:text-base">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Store Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Awaiting Store Receipt</p>
              <h3 className="text-2xl font-black text-amber-900 mt-0.5">{pendingReceiptCount}</h3>
            </div>
            {pendingReceiptCount > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Received at Hub</p>
              <h3 className="text-2xl font-black text-emerald-900 mt-0.5">{receivedAtStoreCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">two_wheeler</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Riders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{riders.length}</h3>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "orders" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">orders</span>
              Store Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("riders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "riders" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">two_wheeler</span>
              Assigned Riders ({riders.length})
            </button>
          </div>

          {activeTab === "orders" && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setStatusFilter("PICKED_UP")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                  statusFilter === "PICKED_UP"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
                }`}
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                Waiting Receipt ({pendingReceiptCount})
              </button>
              <button
                onClick={() => setStatusFilter("RECEIVED_AT_STORE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  statusFilter === "RECEIVED_AT_STORE"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Received at Hub ({receivedAtStoreCount})
              </button>
            </div>
          )}
        </div>

        {/* Orders Table Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                <p className="font-semibold text-sm">No orders matching this criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Service &amp; Items</th>
                      <th className="px-6 py-4">Auth Code</th>
                      <th className="px-6 py-4">Assigned Rider</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Store Handover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o) => {
                      const badge = STATUS_BADGES[o.status] || {
                        label: o.status,
                        style: "bg-gray-100 text-gray-700 border-gray-200",
                      };

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                            <button
                              onClick={() => setSelectedHistoryOrder(o)}
                              className="hover:underline flex items-center gap-1"
                              title="View full history & details"
                            >
                              #{String(o.id).padStart(4, "0")}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{o.customer?.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{o.customer?.phone || o.customer?.email}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{o.pickupAddress}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg mb-1">
                              {o.serviceType || "Laundry Service"}
                            </span>
                            <p className="text-xs text-slate-600 line-clamp-1">{o.itemsDescription}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                              {o.verificationCode || "----"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {o.rider ? (
                              <div>
                                <p className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm text-indigo-600">two_wheeler</span>
                                  {o.rider.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">{o.rider.phone || "—"}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.style}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {o.status === "PICKED_UP" ? (
                              <div className="flex flex-col gap-2 items-center">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-digit code"
                                  value={verificationCodeInputs[o.id] || ""}
                                  onChange={(e) => setVerificationCodeInputs({ ...verificationCodeInputs, [o.id]: e.target.value.replace(/\D/g, '') })}
                                  className="w-24 text-center border border-slate-300 rounded-lg py-1.5 text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => handleConfirmReceive(o.id)}
                                  disabled={updatingOrderId === o.id || (verificationCodeInputs[o.id]?.length !== 4)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 mx-auto"
                                >
                                  {updatingOrderId === o.id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  )}
                                  Receive
                                </button>
                              </div>
                            ) : ["RECEIVED_AT_STORE", "IN_WASHING", "IN_LAUNDRY"].includes(o.status) ? (
                              <div className="flex flex-col gap-2 items-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <span className="material-symbols-outlined text-[12px]">verified</span>
                                  Received at Hub
                                </span>
                                <button
                                  onClick={() => handleMarkReady(o.id)}
                                  disabled={updatingOrderId === o.id}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md shadow-indigo-200 transition-all mx-auto"
                                >
                                  {updatingOrderId === o.id ? "Updating..." : "Mark Ready"}
                                </button>
                              </div>
                            ) : o.status === "READY_FOR_DELIVERY" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                                Awaiting Delivery Pickup
                              </span>
                            ) : o.status === "DELIVERED" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                <span className="material-symbols-outlined text-[12px]">done_all</span>
                                Order Complete
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Riders Tab */}
        {activeTab === "riders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {riders.length === 0 ? (
              <div className="col-span-full p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">two_wheeler</span>
                <p className="font-semibold text-sm">No riders assigned to this store branch yet.</p>
              </div>
            ) : (
              riders.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{r.name}</h4>
                    <p className="text-xs text-slate-500 font-mono truncate">{r.email}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{r.phone || "No phone listed"}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                      {r._count?.deliveries || 0} Delivered
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════ ORDER HISTORY MODAL ══════════ */}
        {selectedHistoryOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order Details & Timeline</h2>
                  <p className="text-sm text-slate-500 font-mono">Order #{String(selectedHistoryOrder.id).padStart(4, "0")}</p>
                </div>
                <button onClick={() => setSelectedHistoryOrder(null)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Order Information</h3>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Customer</p>
                    <p className="text-sm font-bold text-slate-900">{selectedHistoryOrder.customer.name}</p>
                    <p className="text-xs text-slate-600">{selectedHistoryOrder.customer.phone || selectedHistoryOrder.customer.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Pickup Address</p>
                    <p className="text-sm text-slate-800">{selectedHistoryOrder.pickupAddress}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Service & Items</p>
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg mb-1">{selectedHistoryOrder.serviceType}</span>
                    <p className="text-sm text-slate-700">{selectedHistoryOrder.itemsDescription}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Verification Code</p>
                    <span className="font-mono font-bold text-lg text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                      {selectedHistoryOrder.verificationCode || "----"}
                    </span>
                  </div>
                </div>

                {/* Timeline Section */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b pb-2 mb-4">Lifecycle Timeline</h3>
                  <div className="relative border-l-2 border-indigo-200 ml-3 pl-6 space-y-6">
                    {/* Created */}
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-white shadow-sm" />
                      <p className="text-xs font-bold text-slate-500 uppercase">Order Placed</p>
                      <p className="text-sm text-slate-900 font-semibold">
                        {new Date(selectedHistoryOrder.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>

                    {/* Picked Up */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${(selectedHistoryOrder as any).pickedUpAt ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      <p className="text-xs font-bold text-slate-500 uppercase">Picked Up by Rider</p>
                      {(selectedHistoryOrder as any).pickedUpAt ? (
                        <>
                          <p className="text-sm text-slate-900 font-semibold">
                            {new Date((selectedHistoryOrder as any).pickedUpAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs text-slate-600">Rider: {selectedHistoryOrder.rider?.name || 'Unknown'}</p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Pending...</p>
                      )}
                    </div>

                    {/* Received at Store */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${(selectedHistoryOrder as any).receivedAtStoreAt ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      <p className="text-xs font-bold text-slate-500 uppercase">Received at Store Hub</p>
                      {(selectedHistoryOrder as any).receivedAtStoreAt ? (
                        <p className="text-sm text-slate-900 font-semibold">
                          {new Date((selectedHistoryOrder as any).receivedAtStoreAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Pending...</p>
                      )}
                    </div>

                    {/* Ready for Delivery */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${(selectedHistoryOrder as any).readyForDeliveryAt ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      <p className="text-xs font-bold text-slate-500 uppercase">Ready for Delivery</p>
                      {(selectedHistoryOrder as any).readyForDeliveryAt ? (
                        <p className="text-sm text-slate-900 font-semibold">
                          {new Date((selectedHistoryOrder as any).readyForDeliveryAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Pending...</p>
                      )}
                    </div>

                    {/* Delivered */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${(selectedHistoryOrder as any).deliveredAt ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <p className="text-xs font-bold text-slate-500 uppercase">Delivered & Complete</p>
                      {(selectedHistoryOrder as any).deliveredAt ? (
                        <>
                          <p className="text-sm text-slate-900 font-semibold">
                            {new Date((selectedHistoryOrder as any).deliveredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs text-slate-600">Delivered by: {(selectedHistoryOrder as any).deliveryRider?.name || selectedHistoryOrder.rider?.name || 'Unknown'}</p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Pending...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t flex justify-end">
                <button
                  onClick={() => setSelectedHistoryOrder(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function StoreAdminDashboardPage() {
  return (
    <RouteGuard allowedRoles={["STORE_ADMIN", "ADMIN"]}>
      <StoreAdminDashboard />
    </RouteGuard>
  );
}
