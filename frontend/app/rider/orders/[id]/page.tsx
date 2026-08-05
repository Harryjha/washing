"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

type OrderDetail = {
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
  createdAt: string;
  customer: { id: number; name: string; email: string; phone?: string; address?: string };
  store?: { name: string; address: string; latitude: number; longitude: number };
  rider?: { id: number; name: string; phone?: string };
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PICKUP: "Pending Pickup",
  RIDER_ASSIGNED: "En Route to Customer",
  PICKED_UP: "Picked Up (En Route to Store)",
  RECEIVED_AT_STORE: "Received at Store Hub",
  IN_LAUNDRY: "In Laundry / Washing",
  READY_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Completed & Delivered",
  CANCELLED: "Cancelled",
};

export default function RiderOrderNavigation({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (!loading && user && user.role !== "RIDER" && user.role !== "ADMIN") router.push("/");
    if (user && (user.role === "RIDER" || user.role === "ADMIN")) {
      fetchOrderDetail();
    }
  }, [user, loading, orderId]);

  const fetchOrderDetail = async () => {
    setFetching(true);
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrderDetail();
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading order navigation details…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">The order specified could not be loaded.</p>
        <Link href="/rider" className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          ← Back to Rider Dashboard
        </Link>
      </div>
    );
  }

  const customerLat = order.pickupLatitude || 12.9352;
  const customerLng = order.pickupLongitude || 77.6245;

  // Native map deep links
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`;
  const wazeUrl = `https://waze.com/ul?ll=${customerLat},${customerLng}&navigate=yes`;
  const appleMapsUrl = `maps://maps.apple.com/?daddr=${customerLat},${customerLng}`;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/rider" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <span className="material-symbols-outlined text-gray-600">arrow_back</span>
            </Link>
            <div>
              <h1 className="font-extrabold text-lg text-gray-900">
                Order #{String(order.id).padStart(4, "0")}
              </h1>
              <p className="text-xs text-gray-500">{order.serviceType}</p>
            </div>
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary">
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 pt-6 space-y-6">

        {/* Start Navigation Action Hero Card */}
        <div className="bg-gradient-to-r from-[#004d64] via-[#006684] to-[#016684] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase text-sky-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Navigation Ready
              </span>
              <h2 className="text-2xl font-black">{order.customer.name}</h2>
              <p className="text-sky-100 text-xs sm:text-sm max-w-md truncate">
                {order.pickupAddress}
              </p>
            </div>

            {/* Turn-by-Turn Deep Links */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary text-xs font-black px-6 py-3.5 rounded-2xl shadow-lg hover:bg-sky-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span className="material-symbols-outlined text-lg">navigation</span>
                Start Google Navigation →
              </a>
            </div>
          </div>
        </div>

        {/* Customer & Location Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Customer Details Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-primary">person</span>
              Customer Contact Info
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 uppercase font-bold block mb-0.5">Name</span>
                <span className="font-bold text-gray-900 text-sm">{order.customer.name}</span>
              </div>

              <div>
                <span className="text-gray-400 uppercase font-bold block mb-0.5">Phone Number</span>
                {order.customer.phone ? (
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    {order.customer.phone}
                  </a>
                ) : (
                  <span className="text-gray-500 font-semibold">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 uppercase font-bold block mb-0.5">Email</span>
                <span className="font-semibold text-gray-800">{order.customer.email}</span>
              </div>
            </div>
          </div>

          {/* Address & Landmark Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-primary">pin_drop</span>
              Pickup Location Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 uppercase font-bold block mb-0.5">Address</span>
                <span className="font-semibold text-gray-900 text-sm leading-relaxed block">
                  {order.pickupAddress}
                </span>
              </div>

              {order.pickupLandmark && (
                <div>
                  <span className="text-gray-400 uppercase font-bold block mb-0.5">Landmark / Flat</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                    📍 {order.pickupLandmark}
                  </span>
                </div>
              )}

              {order.store && (
                <div>
                  <span className="text-gray-400 uppercase font-bold block mb-0.5">Assigned Laundry Hub</span>
                  <span className="font-bold text-primary">{order.store.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Instructions & Garments Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Garments &amp; Instructions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="text-gray-400 font-bold uppercase block mb-1">Items Description</span>
              <span className="font-bold text-gray-900 text-sm">{order.itemsDescription}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="text-gray-400 font-bold uppercase block mb-1">Special Instructions</span>
              <span className="font-semibold text-gray-800">
                {order.specialNote || "No special instructions provided."}
              </span>
            </div>
          </div>
        </div>

        {/* Rider Status Action Controls */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-primary">swap_calls</span>
            Task Status Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {order.status === "PENDING_PICKUP" && (
              <button
                onClick={() => handleUpdateStatus("RIDER_ASSIGNED")}
                disabled={updating}
                className="w-full bg-primary text-white font-bold text-xs py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                Accept &amp; Start Route
              </button>
            )}

            {(order.status === "PENDING_PICKUP" || order.status === "RIDER_ASSIGNED") && (
              <button
                onClick={() => handleUpdateStatus("PICKED_UP")}
                disabled={updating}
                className="w-full bg-emerald-600 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                ✓ Clothes Picked Up
              </button>
            )}

            {order.status === "PICKED_UP" && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">store</span>
                <span>Picked up! Please deliver items to {order.store?.name || "the Store Hub"}. Store Admin will confirm receipt.</span>
              </div>
            )}

            {order.status === "RECEIVED_AT_STORE" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span>✓ Delivered to Store Hub. Store Admin has verified and confirmed receipt!</span>
              </div>
            )}

            {order.status === "READY_FOR_DELIVERY" && (
              <button
                onClick={() => handleUpdateStatus("DELIVERED")}
                disabled={updating}
                className="w-full bg-emerald-600 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                ✓ Mark Order Delivered
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
