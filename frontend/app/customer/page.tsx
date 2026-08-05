"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileDropdown from "../../components/ProfileDropdown";

type Order = {
  id: number;
  status: string;
  serviceType?: string;
  itemsDescription: string;
  pickupAddress: string;
  pickupDate?: string;
  specialNote?: string;
  verificationCode?: string;
  createdAt: string;
  rider?: { name: string; phone: string } | null;
};

const SERVICES_LIST = [
  {
    id: "wash-and-fold",
    label: "Wash & Fold",
    icon: "local_laundry_service",
    price: "₹79 / KG",
    color: "bg-[#29B6F6]",
    textColor: "text-white",
    desc: "Daily essentials washed, dried & neatly folded.",
  },
  {
    id: "wash-and-ironing",
    label: "Wash & Iron",
    icon: "iron",
    price: "₹120 / KG",
    color: "bg-[#26A69A]",
    textColor: "text-white",
    desc: "Washed & steam-pressed for a crisp finish.",
  },
  {
    id: "premium-laundry",
    label: "Premium Laundry",
    icon: "verified",
    price: "₹199 / KG",
    color: "bg-[#5C6BC0]",
    textColor: "text-white",
    desc: "Individual protection & priority care.",
  },
  {
    id: "dry-cleaning",
    label: "Dry Cleaning",
    icon: "dry_cleaning",
    price: "From ₹119 / ITEM",
    color: "bg-[#D84315]",
    textColor: "text-white",
    desc: "Waterless solvent care for delicate wear.",
  },
  {
    id: "household-laundry",
    label: "Household Laundry",
    icon: "bed",
    price: "₹169 / ITEM",
    color: "bg-[#388E3C]",
    textColor: "text-white",
    desc: "Deep clean for duvets, blankets & linen.",
  },
  {
    id: "express-service",
    label: "Express Service",
    icon: "bolt",
    price: "₹249 / KG",
    color: "bg-[#F57C00]",
    textColor: "text-white",
    desc: "6-Hour rapid turnaround turnaround.",
  },
];

const STATUS_STEPS = ["PENDING", "PICKED_UP", "IN_WASHING", "READY_FOR_DELIVERY", "DELIVERED"];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  PENDING:            { label: "Pickup Scheduled",  bg: "bg-amber-100",  text: "text-amber-800",  icon: "schedule" },
  PICKED_UP:          { label: "Picked Up",        bg: "bg-blue-100",   text: "text-blue-800",   icon: "local_shipping" },
  IN_WASHING:         { label: "In Washing",       bg: "bg-purple-100", text: "text-purple-800", icon: "local_laundry_service" },
  READY_FOR_DELIVERY: { label: "Out for Delivery", bg: "bg-teal-100",   text: "text-teal-800",   icon: "delivery_dining" },
  DELIVERED:          { label: "Delivered",        bg: "bg-emerald-100 font-bold", text: "text-emerald-800", icon: "check_circle" },
  CANCELLED:          { label: "Cancelled",        bg: "bg-rose-100",   text: "text-rose-800",   icon: "cancel" },
};

export default function CustomerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Wash & Fold");
  const [newOrder, setNewOrder] = useState({ itemsDescription: "", pickupAddress: "", pickupDate: "", specialNote: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (user && user.role !== "CUSTOMER") router.push("/");
    if (user && user.role === "CUSTOMER") fetchOrders();
  }, [user, loading]);

  const fetchOrders = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:5001/api/orders/my-orders", {
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          serviceType: selectedService,
          itemsDescription: newOrder.itemsDescription || selectedService,
          pickupAddress: newOrder.pickupAddress,
          pickupDate: newOrder.pickupDate || null,
          specialNote: newOrder.specialNote || null,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewOrder({ itemsDescription: "", pickupAddress: "", pickupDate: "", specialNote: "" });
        fetchOrders();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  return (
    <div className="bg-[#f8fafb] text-[#191c1d] min-h-screen font-sans">
      {/* ─── Top Navbar ─── */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-[1200px] mx-auto">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Washington Laundrettes" className="h-[56px] md:h-[68px] w-auto max-w-[280px] object-contain object-left" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/services" className="text-gray-600 hover:text-primary transition-colors">Services</Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it Works</Link>
            <Link href="/#main-pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="/customer" className="text-primary font-bold border-b-2 border-primary pb-1">My Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              + Quick Pickup
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">

        {/* ── Welcome Banner Card ── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#004d64] via-[#006684] to-[#016684] text-white rounded-3xl p-8 md:p-10 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-sky-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Customer Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-sky-100 text-sm md:text-base max-w-lg">
                Track your laundry in real-time, view order history, or schedule a fresh pickup in seconds.
              </p>
            </div>

            {/* Quick Stats Bento */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-2xl flex-1 md:flex-none min-w-[110px] text-center">
                <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">Active</p>
                <p className="text-3xl font-black mt-0.5">{activeOrders.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-2xl flex-1 md:flex-none min-w-[110px] text-center">
                <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-black mt-0.5">{completedOrders.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-2xl flex-1 md:flex-none min-w-[110px] text-center">
                <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">Total</p>
                <p className="text-3xl font-black mt-0.5">{orders.length}</p>
              </div>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* ── Active Orders Section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_laundry_service</span>
              Active Orders ({activeOrders.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              + Schedule Pickup
            </button>
          </div>

          {fetching ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-sm">
              Loading orders…
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-gray-300">shopping_bag</span>
              <p className="text-gray-600 font-semibold text-sm">No active orders right now.</p>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                Need your garments cleaned? Pick a service below or schedule a quick pickup!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeOrders.map((order) => {
                const conf = STATUS_CONFIG[order.status] || {
                  label: order.status,
                  bg: "bg-gray-100",
                  text: "text-gray-800",
                  icon: "info",
                };
                const currentStepIdx = STATUS_STEPS.indexOf(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5 hover:border-primary/30 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary text-base">
                            #{String(order.id).padStart(4, "0")}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {order.serviceType || "Standard Laundry"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>

                      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs ${conf.bg} ${conf.text}`}>
                        <span className="material-symbols-outlined text-base">{conf.icon}</span>
                        {conf.label}
                      </div>
                    </div>

                    {/* Verification Code Box */}
                    {order.verificationCode && order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Delivery Code</p>
                          <p className="text-[10px] text-indigo-700 mt-0.5">Share with rider at final drop-off</p>
                        </div>
                        <span className="font-mono text-2xl font-black text-indigo-600 tracking-widest">{order.verificationCode}</span>
                      </div>
                    )}

                    {/* Order Tracker Progress Bar */}
                    {order.status !== "CANCELLED" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                          <span>Pickup</span>
                          <span>In Washing</span>
                          <span>Delivered</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-primary h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${Math.max(15, ((currentStepIdx + 1) / STATUS_STEPS.length) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-gray-50 p-4 rounded-xl">
                      <div>
                        <span className="text-gray-400 uppercase font-bold block mb-0.5">Items</span>
                        <span className="font-semibold text-gray-800">{order.itemsDescription || "Garments"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase font-bold block mb-0.5">Pickup Address</span>
                        <span className="font-semibold text-gray-800 truncate block">{order.pickupAddress}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase font-bold block mb-0.5">Pickup Date</span>
                        <span className="font-semibold text-gray-800">
                          {order.pickupDate
                            ? new Date(order.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "As scheduled"}
                        </span>
                      </div>
                    </div>

                    {/* Rider Info if assigned */}
                    {order.rider && (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-medium">
                        <span className="material-symbols-outlined text-emerald-600">two_wheeler</span>
                        <span>
                          Assigned Rider: <strong className="font-bold">{order.rider.name}</strong> ({order.rider.phone})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Services Quick Order Shortcuts ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">dry_cleaning</span>
              Book Our Services
            </h2>
            <Link href="/services" className="text-xs font-bold text-primary hover:underline">
              View All Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES_LIST.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${svc.color} ${svc.textColor} flex items-center justify-center shadow-md`}>
                    <span className="material-symbols-outlined text-2xl">{svc.icon}</span>
                  </div>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {svc.price}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-base">{svc.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{svc.desc}</p>
                </div>

                <Link
                  href={`/services?service=${svc.id}`}
                  className="w-full bg-gray-100 group-hover:bg-primary group-hover:text-white text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-all text-center block"
                >
                  Order {svc.label} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Past Completed Orders Section ── */}
        {completedOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">history</span>
              Completed Order History ({completedOrders.length})
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {completedOrders.map((o) => (
                  <div key={o.id} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="font-mono font-bold text-primary">#{String(o.id).padStart(4, "0")}</span>
                      <span className="ml-2 font-semibold text-gray-800">{o.serviceType || "Laundry"}</span>
                      <p className="text-gray-400 mt-0.5">{o.itemsDescription}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        Delivered
                      </span>
                      <p className="text-gray-400 mt-1">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ─── Schedule Pickup Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Quick Pickup</h2>
                <p className="text-xs text-gray-400">Place an order directly from your dashboard</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {SERVICES_LIST.map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Garments / Items Description</label>
                <input
                  type="text"
                  placeholder="e.g. 4 Shirts, 2 Jeans, 1 Jacket"
                  value={newOrder.itemsDescription}
                  onChange={(e) => setNewOrder({ ...newOrder, itemsDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full pickup address"
                  value={newOrder.pickupAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, pickupAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newOrder.pickupDate}
                  onChange={(e) => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handle with care, call before pickup"
                  value={newOrder.specialNote}
                  onChange={(e) => setNewOrder({ ...newOrder, specialNote: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
