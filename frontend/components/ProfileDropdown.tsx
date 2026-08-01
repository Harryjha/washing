"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    "bg-[#004d64] text-white",
  RIDER:    "bg-[#006687] text-white",
  CUSTOMER: "bg-primary-container text-on-primary-container",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN:    "Admin",
  RIDER:    "Rider",
  CUSTOMER: "Customer",
};

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const dashboardPath =
    user.role === "ADMIN" ? "/admin" : user.role === "RIDER" ? "/rider" : "/customer";
  const dashboardLabel =
    user.role === "ADMIN" ? "Admin Dashboard" : user.role === "RIDER" ? "Rider Portal" : "My Dashboard";
  const avatarBg = ROLE_COLORS[user.role] || "bg-primary text-white";

  return (
    <div ref={ref} className="relative">
      {/* ─── Avatar Button ─── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 group focus:outline-none"
        aria-label="Profile menu"
      >
        {/* Avatar circle */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-md ring-2 ring-white/80 transition-all group-hover:ring-primary/40 ${avatarBg}`}
        >
          {getInitials(user.name)}
        </div>
        {/* Name (hidden on small screens) */}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-on-surface leading-tight max-w-[100px] truncate">
            {user.name}
          </p>
          <p className="text-[10px] font-semibold text-outline leading-tight uppercase tracking-wider">
            {ROLE_LABELS[user.role] || user.role}
          </p>
        </div>
        {/* Chevron */}
        <span
          className={`material-symbols-outlined text-[16px] text-outline transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {/* ─── Dropdown Panel ─── */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-[#004d64] to-[#016684] text-white">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shadow-md ring-2 ring-white/30 ${avatarBg}`}>
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight truncate">{user.name}</p>
                <p className="text-[11px] opacity-80 leading-tight truncate">{user.email}</p>
                <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            {/* Dashboard */}
            <Link
              href={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">dashboard</span>
              {dashboardLabel}
            </Link>

            {/* Customer-only: My Orders & Schedule Pickup */}
            {user.role === "CUSTOMER" && (
              <>
                <Link
                  href="/customer#orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                  My Orders
                </Link>
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">local_laundry_service</span>
                  Book a Service
                </Link>
              </>
            )}

            {/* Admin-only: Manage Orders */}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">manage_accounts</span>
                Manage Orders
              </Link>
            )}

            {/* Rider-only: View Pickups */}
            {user.role === "RIDER" && (
              <Link
                href="/rider"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">local_shipping</span>
                View Pickups
              </Link>
            )}

            {/* Home */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">home</span>
              Home Page
            </Link>

            <div className="my-1.5 border-t border-gray-100" />

            {/* Settings */}
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-gray-400">settings</span>
              Settings
            </button>

            <div className="my-1.5 border-t border-gray-100" />

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
