"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import ProfileDropdown from "../../components/ProfileDropdown";

type Order = {
  id: number;
  status: string;
  serviceType: string;
  pickupDate: string;
  address?: string;
  pickupAddress?: string;
  itemsDescription: string;
  customer: { name: string; email: string; phone?: string };
  rider?: { name: string; phone?: string } | null;
  deliveryRider?: { name: string; phone?: string } | null;
  createdAt: string;
  pickedUpAt?: string;
  receivedAtStoreAt?: string;
  readyForDeliveryAt?: string;
  deliveredAt?: string;
  verificationCode?: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  _count: { orders: number };
};

type Rider = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  storeId?: string;
  store?: { id: string; name: string };
  stores?: { id: string; name: string }[];
  createdAt: string;
  _count: { deliveries: number };
};

type StoreObj = {
  id: string;
  name: string;
  address: string;
};

type ActiveView = "dashboard" | "orders" | "customers" | "services" | "riders" | "store-admins";

type StoreAdmin = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  storeId?: string;
  store?: { id: string; name: string; address?: string };
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:              "bg-secondary-container text-on-secondary-container",
  PICKED_UP:            "bg-primary-container text-on-primary-container",
  RECEIVED_AT_STORE:    "bg-indigo-100 text-indigo-800 font-bold border border-indigo-200",
  IN_WASHING:           "bg-surface-variant text-on-surface-variant",
  READY_FOR_DELIVERY:   "bg-tertiary-container text-on-tertiary-container",
  DELIVERED:            "bg-primary text-white",
  CANCELLED:            "bg-error-container text-on-error-container",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:            "Pending",
  PICKED_UP:          "Picked Up",
  RECEIVED_AT_STORE:  "At Store Hub",
  IN_WASHING:         "In Progress",
  READY_FOR_DELIVERY: "Ready",
  DELIVERED:          "Completed",
  CANCELLED:          "Cancelled",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-container text-on-primary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-surface-variant text-on-surface-variant",
];

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [deleteCustomerConfirmId, setDeleteCustomerConfirmId] = useState<number | null>(null);

  // Riders & Stores state
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stores, setStores] = useState<StoreObj[]>([]);
  const [riderSearch, setRiderSearch] = useState("");
  const [isAddRiderOpen, setIsAddRiderOpen] = useState(false);
  const [addRiderForm, setAddRiderForm] = useState<{ name: string; email: string; password: string; phone: string; storeIds: string[] }>({ name: "", email: "", password: "", phone: "", storeIds: [] });
  const [addRiderError, setAddRiderError] = useState("");
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [editRiderForm, setEditRiderForm] = useState<{ name: string; email: string; phone: string; storeIds: string[]; password: string }>({ name: "", email: "", phone: "", storeIds: [], password: "" });
  const [deletingRiderId, setDeletingRiderId] = useState<number | null>(null);
  const [deleteRiderConfirmId, setDeleteRiderConfirmId] = useState<number | null>(null);
  // Store Admins state
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [storeAdminSearch, setStoreAdminSearch] = useState("");
  const [isAddStoreAdminOpen, setIsAddStoreAdminOpen] = useState(false);
  const [addStoreAdminForm, setAddStoreAdminForm] = useState({ name: "", email: "", password: "", phone: "", storeId: "" });
  const [addStoreAdminError, setAddStoreAdminError] = useState("");
  const [editingStoreAdmin, setEditingStoreAdmin] = useState<StoreAdmin | null>(null);
  const [editStoreAdminForm, setEditStoreAdminForm] = useState({ name: "", email: "", phone: "", storeId: "", password: "" });
  const [deletingStoreAdminId, setDeletingStoreAdminId] = useState<number | null>(null);
  const [deleteStoreAdminConfirmId, setDeleteStoreAdminConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (!loading && user && user.role !== "ADMIN") router.push("/");
    if (user && user.role === "ADMIN") {
      fetchOrders();
      fetchStores();
    }
  }, [user, loading]);

  useEffect(() => {
    if (activeView === "customers" && user?.role === "ADMIN") fetchCustomers();
    if (activeView === "riders" && user?.role === "ADMIN") fetchRiders();
    if (activeView === "store-admins" && user?.role === "ADMIN") fetchStoreAdmins();
  }, [activeView]);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5001/api/orders/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const fetchCustomers = async () => {
    const res = await fetch("http://localhost:5001/api/customers", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCustomers(data);
    }
  };

  const fetchStores = async () => {
    const res = await fetch("http://localhost:5001/api/orders/stores");
    if (res.ok) {
      const data = await res.json();
      setStores(data);
    }
  };

  const fetchRiders = async () => {
    const res = await fetch("http://localhost:5001/api/riders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      const data = await res.json();
      setRiders(data);
    }
  };

  const createRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddRiderError("");
    const res = await fetch("http://localhost:5001/api/riders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(addRiderForm),
    });

    if (res.ok) {
      setIsAddRiderOpen(false);
      setAddRiderForm({ name: "", email: "", password: "", phone: "", storeIds: [] });
      fetchRiders();
    } else {
      const err = await res.json();
      setAddRiderError(err.error || "Failed to register rider");
    }
  };

  const openEditRider = (r: Rider) => {
    setEditingRider(r);
    
    let existingStoreIds: string[] = [];
    if (r.stores && r.stores.length > 0) {
      existingStoreIds = r.stores.map(s => s.id);
    } else if (r.storeId) {
      existingStoreIds = [r.storeId];
    } else if (r.store?.id) {
      existingStoreIds = [r.store.id];
    }

    setEditRiderForm({
      name: r.name,
      email: r.email,
      phone: r.phone || "",
      storeIds: existingStoreIds,
      password: "",
    });
  };

  const saveRider = async () => {
    if (!editingRider) return;
    const res = await fetch(`http://localhost:5001/api/riders/${editingRider.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editRiderForm),
    });
    if (res.ok) {
      setEditingRider(null);
      fetchRiders();
    }
  };

  const deleteRider = async (id: number) => {
    setDeletingRiderId(id);
    const res = await fetch(`http://localhost:5001/api/riders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) setRiders((prev) => prev.filter((r) => r.id !== id));
    setDeletingRiderId(null);
    setDeleteRiderConfirmId(null);
  };

  const fetchStoreAdmins = async () => {
    const res = await fetch("http://localhost:5001/api/store-admins", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStoreAdmins(data);
    }
  };

  const createStoreAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreAdminError("");
    const res = await fetch("http://localhost:5001/api/store-admins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(addStoreAdminForm),
    });

    if (res.ok) {
      setIsAddStoreAdminOpen(false);
      setAddStoreAdminForm({ name: "", email: "", password: "", phone: "", storeId: "" });
      fetchStoreAdmins();
    } else {
      const err = await res.json();
      setAddStoreAdminError(err.error || "Failed to register store admin");
    }
  };

  const openEditStoreAdmin = (sa: StoreAdmin) => {
    setEditingStoreAdmin(sa);
    setEditStoreAdminForm({
      name: sa.name,
      email: sa.email,
      phone: sa.phone || "",
      storeId: sa.storeId || sa.store?.id || "",
      password: "",
    });
  };

  const saveStoreAdmin = async () => {
    if (!editingStoreAdmin) return;
    const res = await fetch(`http://localhost:5001/api/store-admins/${editingStoreAdmin.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editStoreAdminForm),
    });
    if (res.ok) {
      setEditingStoreAdmin(null);
      fetchStoreAdmins();
    }
  };

  const deleteStoreAdmin = async (id: number) => {
    setDeletingStoreAdminId(id);
    const res = await fetch(`http://localhost:5001/api/store-admins/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) setStoreAdmins((prev) => prev.filter((sa) => sa.id !== id));
    setDeletingStoreAdminId(null);
    setDeleteStoreAdminConfirmId(null);
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    const res = await fetch(`http://localhost:5001/api/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchOrders();
    setUpdatingId(null);
  };

  const deleteOrder = async (id: number) => {
    setDeletingId(id);
    const res = await fetch(`http://localhost:5001/api/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    setDeletingId(null);
    setDeleteConfirmId(null);
  };

  const openEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setEditForm({ name: c.name, email: c.email, phone: c.phone || "", address: c.address || "" });
  };

  const saveCustomer = async () => {
    if (!editingCustomer) return;
    const res = await fetch(`http://localhost:5001/api/customers/${editingCustomer.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingCustomer(null);
      fetchCustomers();
    }
  };

  const deleteCustomer = async (id: number) => {
    setDeletingCustomerId(id);
    const res = await fetch(`http://localhost:5001/api/customers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) setCustomers((prev) => prev.filter((c) => c.id !== id));
    setDeletingCustomerId(null);
    setDeleteCustomerConfirmId(null);
  };

  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold">Loading dashboard…</p>
        </div>
      </div>
    );

  // Derived stats
  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const inProgress = orders.filter((o) => ["PICKED_UP", "IN_WASHING", "READY_FOR_DELIVERY"].includes(o.status)).length;

  // Filtered orders
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchService = serviceFilter === "ALL" || o.serviceType === serviceFilter;
    const matchSearch =
      !searchQuery ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.id).includes(searchQuery);
    return matchStatus && matchService && matchSearch;
  });

  const recent = orders.slice(0, 5);

  // ─── Sidebar Item ─────────────────────────────────────────────────────────
  const NavItem = ({
    view,
    icon,
    label,
  }: {
    view: ActiveView;
    icon: string;
    label: string;
  }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all group text-left ${
        activeView === view
          ? "bg-secondary-container text-on-secondary-container font-semibold"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <span className="material-symbols-outlined mr-4">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="bg-background text-on-surface min-h-screen" style={{ fontFamily: "Work Sans, sans-serif" }}>
      {/* ─── Sidebar ─── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex-col shadow-[1px_0_8px_rgba(0,0,0,0.04)]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-white">local_laundry_service</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-primary uppercase">Washington</span>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          <NavItem view="dashboard"    icon="dashboard"      label="Dashboard"  />
          <NavItem view="orders"       icon="list_alt"       label="Orders"     />
          <NavItem view="customers"    icon="group"          label="Customers"  />
          <NavItem view="services"     icon="dry_cleaning"   label="Services"   />
          <NavItem view="riders"       icon="two_wheeler"    label="Riders"     />
          <NavItem view="store-admins" icon="badge" label="Store Admins" />
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left">
            <span className="material-symbols-outlined mr-4">settings</span>Settings
          </button>
        </nav>

        <div className="p-6 border-t border-outline-variant/30 text-center">
          <span className="text-xs font-semibold text-outline tracking-widest uppercase">System v2.4.0</span>
        </div>
      </aside>

      {/* ─── Right column ─── */}
      <div className="md:pl-72">
        {/* ─── Top Header ─── */}
        <header className="fixed top-0 left-0 md:left-72 right-0 h-20 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-96">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-outline"
              placeholder="Search orders or customers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            <button className="relative text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full" />
            </button>

            <div className="hidden md:block pl-6 border-l border-outline-variant/30">
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* ─── Main ─── */}
        <main className="pt-20 min-h-screen px-6 py-6">
          {/* ══════════ DASHBOARD VIEW ══════════ */}
          {activeView === "dashboard" && (
            <div className="flex flex-col gap-10">

              {/* Hero Stats */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Label */}
                <div className="col-span-1 md:col-span-2 flex flex-col justify-end pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Operations</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight">Order Management</h1>
                  <p className="text-on-surface-variant mt-2 max-w-md text-sm">Real-time oversight of Washington's hygiene logistics and service throughput.</p>
                </div>

                {/* Stat: Pending */}
                <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border-b-4 border-primary relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px] text-primary">local_shipping</span>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <span className="text-[11px] font-bold text-primary bg-primary-container px-2 py-1 rounded uppercase">Active</span>
                  </div>
                  <div className="relative z-10 mt-4">
                    <div className="text-4xl font-black text-on-surface">{pending}</div>
                    <div className="text-xs font-bold text-outline uppercase tracking-wider mt-1">Pending Pickups</div>
                  </div>
                </div>

                {/* Stat: Completed */}
                <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border-b-4 border-secondary relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px] text-secondary">check_circle</span>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-[11px] font-bold text-secondary bg-secondary-container px-2 py-1 rounded uppercase">Done</span>
                  </div>
                  <div className="relative z-10 mt-4">
                    <div className="text-4xl font-black text-on-surface">{delivered}</div>
                    <div className="text-xs font-bold text-outline uppercase tracking-wider mt-1">Completed Orders</div>
                  </div>
                </div>
              </section>

              {/* Bento Row: Stats + Quick Actions */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Recent Orders Table */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-on-surface">Recent Orders</h2>
                    <button
                      onClick={() => setActiveView("orders")}
                      className="flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
                    >
                      View All
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/30">
                          <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Service</th>
                          <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Pickup</th>
                          <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {recent.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant text-sm">
                              No orders yet.
                            </td>
                          </tr>
                        ) : (
                          recent.map((o, idx) => (
                            <tr key={o.id} className="hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                              <td className="px-6 py-4 font-mono font-semibold text-on-surface-variant text-sm">#{String(o.id).padStart(4, "0")}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                    {initials(o.customer.name)}
                                  </div>
                                  <span className="font-medium text-on-surface text-sm">{o.customer.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant text-sm">{o.serviceType || "—"}</td>
                              <td className="px-6 py-4 text-on-surface-variant text-sm">
                                {o.pickupDate ? new Date(o.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[o.status] || "bg-surface-variant text-on-surface-variant"}`}>
                                  {STATUS_LABEL[o.status] || o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions + Bar Chart */}
                <aside className="lg:col-span-4 flex flex-col gap-6">

                  {/* Quick Actions */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
                    <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                      Quick Actions
                    </h3>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setActiveView("orders")}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-primary text-white hover:opacity-90 transition-all shadow-md group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined">list_alt</span>
                          <span className="font-semibold text-sm">Manage Orders</span>
                        </div>
                        <span className="material-symbols-outlined opacity-70 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      </button>

                      <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-secondary-container text-on-secondary-container hover:opacity-90 transition-all group">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined">calendar_today</span>
                          <span className="font-semibold text-sm">Daily Schedule</span>
                        </div>
                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      </button>

                      <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-all group">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined">inventory</span>
                          <span className="font-semibold text-sm">Inventory</span>
                        </div>
                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Volume Bars */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-outline uppercase tracking-widest">Order Volume</h3>
                      <span className="text-xs font-bold text-primary">This Week</span>
                    </div>
                    <div className="h-28 w-full flex items-end justify-between gap-2 px-2">
                      {[40, 65, 55, 85, 45, 70, 30].map((h, i) => (
                        <div
                          key={i}
                          className={`w-full rounded-t-sm transition-all ${i === 3 ? "bg-primary shadow-[0_-4px_10px_rgba(0,77,100,0.2)]" : "bg-surface-container-high hover:bg-primary-container"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <span key={i} className={`text-[10px] font-bold ${i === 3 ? "text-primary" : "text-outline"}`}>{d}</span>
                      ))}
                    </div>
                  </div>
                </aside>
              </section>

              {/* Operational Health */}
              <section className="bg-surface-container p-6 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Facility Health</h2>
                    <p className="text-on-surface-variant text-sm">Real-time status of Washington Laundry processing units</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Washer Unit A-1", status: "Running",  statusColor: "text-primary",   dotColor: "bg-primary",   bar: "bg-primary",   width: 72, cycle: "Heavy Load",   remaining: "12m remaining" },
                    { name: "Washer Unit B-4", status: "Idle",     statusColor: "text-secondary", dotColor: "bg-secondary", bar: "bg-secondary", width: 0,  cycle: "N/A",          remaining: "Ready for load" },
                    { name: "Dryer Unit C-2",  status: "Cooling",  statusColor: "text-tertiary",  dotColor: "bg-tertiary",  bar: "bg-tertiary",  width: 95, cycle: "Delicate",      remaining: "2m remaining"  },
                  ].map((m) => (
                    <div key={m.name} className="bg-white p-4 rounded-lg flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-on-surface text-sm">{m.name}</span>
                        <span className={`text-xs font-bold ${m.statusColor} flex items-center gap-1`}>
                          <span className={`w-2 h-2 rounded-full ${m.dotColor}`} /> {m.status}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className={`${m.bar} h-full transition-all duration-1000`} style={{ width: `${m.width}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-outline uppercase">
                        <span>Cycle: {m.cycle}</span>
                        <span>{m.remaining}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ══════════ ORDERS VIEW ══════════ */}
          {activeView === "orders" && (
            <div className="flex flex-col gap-8">

              {/* Page Header + Stats */}
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 flex flex-col justify-end pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Operations</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-on-surface leading-tight">Order Management</h1>
                  <p className="text-on-surface-variant mt-2 max-w-md text-sm">Real-time oversight of Washington's hygiene logistics and service throughput.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border-b-4 border-primary">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <span className="text-[11px] font-bold text-primary bg-primary-container px-2 py-1 rounded uppercase">Active</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl font-black text-on-surface">{pending}</div>
                    <div className="text-xs font-bold text-outline uppercase tracking-wider mt-1">Pending Pickups</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between border-b-4 border-secondary">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-[11px] font-bold text-secondary bg-secondary-container px-2 py-1 rounded uppercase">+{delivered}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl font-black text-on-surface">{delivered}</div>
                    <div className="text-xs font-bold text-outline uppercase tracking-wider mt-1">Completed</div>
                  </div>
                </div>
              </section>

              {/* Filter Bar */}
              <section>
                <div className="bg-surface-container-low p-4 rounded-full shadow-md flex flex-wrap items-center gap-4 border border-outline-variant/20">
                  <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full shadow-sm border border-outline-variant/30 flex-1 min-w-[180px]">
                    <span className="material-symbols-outlined text-outline text-[20px]">filter_list</span>
                    <select
                      className="bg-transparent border-none outline-none text-sm text-on-surface w-full"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PICKED_UP">Picked Up</option>
                      <option value="IN_WASHING">In Washing</option>
                      <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-full shadow-sm border border-outline-variant/30 flex-1 min-w-[180px]">
                    <span className="material-symbols-outlined text-outline text-[20px]">dry_cleaning</span>
                    <select
                      className="bg-transparent border-none outline-none text-sm text-on-surface w-full"
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                    >
                      <option value="ALL">All Services</option>
                      <option value="Wash & Fold">Wash & Fold</option>
                      <option value="Wash & Iron">Wash & Iron</option>
                      <option value="Premium Laundry">Premium Laundry</option>
                      <option value="Dry Cleaning">Dry Cleaning</option>
                      <option value="Express Service">Express Service</option>
                      <option value="Household Laundry">Household Laundry</option>
                    </select>
                  </div>

                  <button
                    onClick={() => { setStatusFilter("ALL"); setServiceFilter("ALL"); setSearchQuery(""); }}
                    className="bg-primary text-white text-xs font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest"
                  >
                    Reset
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
              </section>

              {/* Orders Data Grid */}
              <section className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Order</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Service</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Auth Code</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Pickup</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Update</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">search_off</span>
                            No orders found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((o, idx) => (
                          <tr key={o.id} className={`hover:bg-surface-container-low transition-colors group ${deletingId === o.id ? "opacity-50" : ""}`}>
                            <td className="px-6 py-5">
                              <button
                                onClick={() => setSelectedHistoryOrder(o)}
                                className="font-mono text-primary font-semibold hover:underline"
                                title="View full history"
                              >
                                #{String(o.id).padStart(4, "0")}
                              </button>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                  {initials(o.customer.name)}
                                </div>
                                <div>
                                  <span className="font-medium text-on-surface text-sm block">{o.customer.name}</span>
                                  {o.customer.email && <span className="text-xs text-outline">{o.customer.email}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-block px-2.5 py-0.5 bg-surface-container-high text-on-surface text-[11px] font-bold rounded-lg border border-outline-variant/30 mb-1">
                                {o.serviceType || "Laundry"}
                              </span>
                              <p className="text-xs text-outline line-clamp-1 max-w-[140px]">{o.itemsDescription}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="font-mono font-bold text-primary bg-primary-container/30 px-2 py-1 rounded border border-primary/20 text-xs">
                                {o.verificationCode || "----"}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-on-surface-variant">
                              <span className="text-sm text-on-surface">
                                {o.pickupDate
                                  ? new Date(o.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                  : "—"}
                              </span>
                            </td>
                            <td className="px-6 py-5 max-w-[200px]">
                              <span className="text-sm text-on-surface-variant truncate block">{o.pickupAddress || "—"}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${STATUS_STYLES[o.status] || "bg-surface-variant text-on-surface-variant"}`}>
                                {STATUS_LABEL[o.status] || o.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <select
                                className={`text-xs font-semibold border border-outline-variant rounded-lg px-2 py-1.5 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none transition-all ${updatingId === o.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                value={o.status}
                                disabled={updatingId === o.id}
                                onChange={(e) => updateStatus(o.id, e.target.value)}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PICKED_UP">Picked Up</option>
                                <option value="IN_WASHING">In Washing</option>
                                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {deleteConfirmId === o.id ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => deleteOrder(o.id)}
                                    disabled={deletingId === o.id}
                                    className="text-[11px] font-bold bg-error text-white px-2 py-1 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                  >
                                    {deletingId === o.id ? "…" : "Yes"}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-[11px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-lg hover:bg-surface-variant transition-all"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(o.id)}
                                  className="text-error hover:bg-error/10 p-2 rounded-full transition-all"
                                  title="Delete order"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination area */}
                <div className="p-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/20">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">
                    Showing {filtered.length} of {totalOrders} orders
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Analytics Panel */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-on-primary-fixed-variant p-6 rounded-2xl text-white relative overflow-hidden flex flex-col justify-center min-h-[240px]">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Route Efficiency Index</h3>
                    <p className="text-white/80 mb-6 max-w-md text-sm">
                      Currently optimizing logistics routes across the Washington metro area.
                    </p>
                    <div className="flex gap-4">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex-1">
                        <span className="text-[10px] font-bold uppercase opacity-70 block mb-1">Avg Turnaround</span>
                        <div className="text-2xl font-bold">22.4 hrs</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex-1">
                        <span className="text-[10px] font-bold uppercase opacity-70 block mb-1">In Progress</span>
                        <div className="text-2xl font-bold">{inProgress}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                <div className="bg-white p-6 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-lg font-bold text-on-surface">Service Distribution</h4>
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100" strokeWidth="4" />
                        <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="65, 100" strokeWidth="4" />
                        <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="25, 100" strokeDashoffset="-65" strokeWidth="4" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-on-surface">W&amp;F</span>
                        <span className="text-[10px] font-bold text-outline">Dominant</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Wash & Fold", pct: "65%", color: "bg-primary" },
                      { label: "Dry Clean",   pct: "25%", color: "bg-secondary" },
                      { label: "Iron Only",   pct: "10%", color: "bg-primary-container" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span>{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ══════════ CUSTOMERS VIEW ══════════ */}
          {activeView === "customers" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Registered Customers ({customers.length})</h2>
                  <p className="text-sm text-outline">Manage user profiles, contact information, and order history.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">search</span>
                  <input
                    type="text"
                    placeholder="Search customers…"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Orders</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-semibold">
                            No customers found.
                          </td>
                        </tr>
                      ) : (
                        customers
                          .filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                          .map((c, idx) => (
                            <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-primary font-bold">#{c.id}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                    {initials(c.name)}
                                  </div>
                                  <span className="font-semibold text-sm text-on-surface">{c.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant">{c.email}</td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant">{c.phone || "—"}</td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[180px] truncate">{c.address || "—"}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {c._count?.orders || 0} orders
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditCustomer(c)}
                                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all"
                                    title="Edit customer details"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                  {deleteCustomerConfirmId === c.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => deleteCustomer(c.id)}
                                        disabled={deletingCustomerId === c.id}
                                        className="text-[11px] font-bold bg-error text-white px-2 py-1 rounded-lg"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeleteCustomerConfirmId(null)}
                                        className="text-[11px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteCustomerConfirmId(c.id)}
                                      className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-all"
                                      title="Delete customer"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SERVICES VIEW ══════════ */}
          {activeView === "services" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Laundry Services &amp; Rates</h2>
                  <p className="text-sm text-outline">Manage active laundry packages, pricing models, and service categories.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 1, name: "Wash & Fold", price: "₹79 / KG", turnAround: "24 Hours", desc: "Everyday clothing washed with care, dried & neatly folded.", icon: "local_laundry_service", color: "bg-sky-500" },
                  { id: 2, name: "Wash & Iron", price: "₹120 / KG", turnAround: "24 Hours", desc: "Washed & steam pressed for a crisp professional finish.", icon: "iron", color: "bg-teal-500" },
                  { id: 3, name: "Premium Laundry", price: "₹199 / KG", turnAround: "48 Hours", desc: "Individual care, organic detergents & fabric protection.", icon: "verified", color: "bg-indigo-500" },
                  { id: 4, name: "Dry Cleaning", price: "₹119 / ITEM", turnAround: "48 Hours", desc: "Waterless solvent cleaning for suits, dresses & delicate fabrics.", icon: "dry_cleaning", color: "bg-orange-500" },
                  { id: 5, name: "Household Laundry", price: "₹169 / ITEM", turnAround: "48 Hours", desc: "Deep wash for heavy duvets, curtains & bedsheets.", icon: "bed", color: "bg-emerald-500" },
                  { id: 6, name: "Express Service", price: "₹249 / KG", turnAround: "6 Hours", desc: "Rapid priority turnaround for urgent laundry needs.", icon: "bolt", color: "bg-amber-500" },
                ].map((svc) => (
                  <div key={svc.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-xl ${svc.color} text-white flex items-center justify-center shadow-md`}>
                        <span className="material-symbols-outlined text-2xl">{svc.icon}</span>
                      </div>
                      <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full">
                        Active
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{svc.name}</h3>
                      <p className="text-xs text-outline mt-1">{svc.desc}</p>
                    </div>

                    <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-outline block">Price Rate</span>
                        <span className="font-bold text-primary text-sm">{svc.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-outline block">Turnaround</span>
                        <span className="font-semibold text-on-surface">{svc.turnAround}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ RIDERS VIEW ══════════ */}
          {activeView === "riders" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Registered Logistics Riders ({riders.length})</h2>
                  <p className="text-sm text-outline">Manage delivery personnel login credentials, assigned store hubs, and tasks.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">search</span>
                    <input
                      type="text"
                      placeholder="Search riders…"
                      value={riderSearch}
                      onChange={(e) => setRiderSearch(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsAddRiderOpen(true);
                      setAddRiderError("");
                    }}
                    className="bg-primary text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Register New Rider
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Rider Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Login Email</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Assigned Store Hub</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Deliveries</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {riders.filter(r => !riderSearch || r.name.toLowerCase().includes(riderSearch.toLowerCase()) || r.email.toLowerCase().includes(riderSearch.toLowerCase()) || (r.store?.name || "").toLowerCase().includes(riderSearch.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-semibold">
                            No riders registered yet. Click &quot;Register New Rider&quot; to create credentials.
                          </td>
                        </tr>
                      ) : (
                        riders
                          .filter(r => !riderSearch || r.name.toLowerCase().includes(riderSearch.toLowerCase()) || r.email.toLowerCase().includes(riderSearch.toLowerCase()) || (r.store?.name || "").toLowerCase().includes(riderSearch.toLowerCase()))
                          .map((r, idx) => (
                            <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-primary font-bold">#{r.id}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                    {initials(r.name)}
                                  </div>
                                  <span className="font-semibold text-sm text-on-surface">{r.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">{r.email}</td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant">{r.phone || "—"}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {(() => {
                                    const assignedStores = r.stores && r.stores.length > 0 ? r.stores : (r.store ? [r.store] : []);
                                    if (assignedStores.length === 0) {
                                      return (
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 inline-flex items-center gap-1.5">
                                          <span className="material-symbols-outlined text-sm">store</span>
                                          Unassigned
                                        </span>
                                      );
                                    }
                                    return assignedStores.map((s) => (
                                      <span key={s.id} className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 inline-flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">store</span>
                                        {s.name}
                                      </span>
                                    ));
                                  })()}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {r._count?.deliveries || 0} tasks
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditRider(r)}
                                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all"
                                    title="Edit rider details / password"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                  {deleteRiderConfirmId === r.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => deleteRider(r.id)}
                                        disabled={deletingRiderId === r.id}
                                        className="text-[11px] font-bold bg-error text-white px-2 py-1 rounded-lg"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeleteRiderConfirmId(null)}
                                        className="text-[11px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteRiderConfirmId(r.id)}
                                      className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-all"
                                      title="Delete rider"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ STORE ADMINS VIEW ══════════ */}
          {activeView === "store-admins" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Store Hub Admins ({storeAdmins.length})</h2>
                  <p className="text-sm text-outline">Create and manage store branch admins who oversee local orders and rider handoffs.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">search</span>
                    <input
                      type="text"
                      placeholder="Search store admins…"
                      value={storeAdminSearch}
                      onChange={(e) => setStoreAdminSearch(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsAddStoreAdminOpen(true);
                      setAddStoreAdminError("");
                    }}
                    className="bg-primary text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">badge</span>
                    Register Store Admin
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Admin Name</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Login Email</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Assigned Store Hub</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {storeAdmins.filter(sa => !storeAdminSearch || sa.name.toLowerCase().includes(storeAdminSearch.toLowerCase()) || sa.email.toLowerCase().includes(storeAdminSearch.toLowerCase()) || (sa.store?.name || "").toLowerCase().includes(storeAdminSearch.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-semibold">
                            No store admins registered yet. Click &quot;Register Store Admin&quot; to create credentials.
                          </td>
                        </tr>
                      ) : (
                        storeAdmins
                          .filter(sa => !storeAdminSearch || sa.name.toLowerCase().includes(storeAdminSearch.toLowerCase()) || sa.email.toLowerCase().includes(storeAdminSearch.toLowerCase()) || (sa.store?.name || "").toLowerCase().includes(storeAdminSearch.toLowerCase()))
                          .map((sa, idx) => (
                            <tr key={sa.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-primary font-bold">#{sa.id}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                    {initials(sa.name)}
                                  </div>
                                  <span className="font-semibold text-sm text-on-surface">{sa.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant font-mono">{sa.email}</td>
                              <td className="px-6 py-4 text-sm text-on-surface-variant">{sa.phone || "—"}</td>
                              <td className="px-6 py-4">
                                <div className="text-left">
                                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 inline-flex items-center gap-1.5 text-left">
                                    <span className="material-symbols-outlined text-sm">store</span>
                                    {sa.store?.name || "Unassigned"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditStoreAdmin(sa)}
                                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all"
                                    title="Edit store admin details / password"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                  {deleteStoreAdminConfirmId === sa.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => deleteStoreAdmin(sa.id)}
                                        disabled={deletingStoreAdminId === sa.id}
                                        className="text-[11px] font-bold bg-error text-white px-2 py-1 rounded-lg"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeleteStoreAdminConfirmId(null)}
                                        className="text-[11px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-lg"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteStoreAdminConfirmId(sa.id)}
                                      className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-all"
                                      title="Delete store admin"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Register New Store Admin Modal */}
          {isAddStoreAdminOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-bold text-on-surface">Register Store Admin</h3>
                  <button onClick={() => setIsAddStoreAdminOpen(false)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {addStoreAdminError && (
                  <div className="p-3 rounded-xl bg-error/10 text-error text-xs font-semibold">{addStoreAdminError}</div>
                )}

                <form onSubmit={createStoreAdmin} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={addStoreAdminForm.name}
                      onChange={(e) => setAddStoreAdminForm({ ...addStoreAdminForm, name: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Login Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.koramangala@laundry.com"
                      value={addStoreAdminForm.email}
                      onChange={(e) => setAddStoreAdminForm({ ...addStoreAdminForm, email: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Initial Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={addStoreAdminForm.password}
                      onChange={(e) => setAddStoreAdminForm({ ...addStoreAdminForm, password: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={addStoreAdminForm.phone}
                      onChange={(e) => setAddStoreAdminForm({ ...addStoreAdminForm, phone: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Assigned Store Hub</label>
                    <select
                      value={addStoreAdminForm.storeId}
                      onChange={(e) => setAddStoreAdminForm({ ...addStoreAdminForm, storeId: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900 bg-white"
                    >
                      <option value="">-- Select Store Branch --</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsAddStoreAdminOpen(false)}
                      className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl text-gray-700"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md">
                      Create Credentials
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Store Admin Modal */}
          {editingStoreAdmin && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-bold text-on-surface">Edit Store Admin Credentials</h3>
                  <button onClick={() => setEditingStoreAdmin(null)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editStoreAdminForm.name}
                      onChange={(e) => setEditStoreAdminForm({ ...editStoreAdminForm, name: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Email</label>
                    <input
                      type="email"
                      value={editStoreAdminForm.email}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingStoreAdmin(null)} className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button onClick={saveStoreAdmin} className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Register New Rider Modal */}
          {isAddRiderOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Register New Rider</h3>
                    <p className="text-xs text-outline">Set up login credentials for delivery personnel</p>
                  </div>
                  <button onClick={() => setIsAddRiderOpen(false)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {addRiderError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
                    {addRiderError}
                  </div>
                )}

                <form onSubmit={createRider} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Rider Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={addRiderForm.name}
                      onChange={(e) => setAddRiderForm({ ...addRiderForm, name: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Login Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rider.ramesh@washington.com"
                      value={addRiderForm.email}
                      onChange={(e) => setAddRiderForm({ ...addRiderForm, email: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Set login password for rider"
                      value={addRiderForm.password}
                      onChange={(e) => setAddRiderForm({ ...addRiderForm, password: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={addRiderForm.phone}
                      onChange={(e) => setAddRiderForm({ ...addRiderForm, phone: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Assigned Store Hubs (Multiple Allowed)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-1">
                      {stores.map((s) => (
                        <label key={s.id} className={`flex items-center gap-2 text-sm p-2.5 border rounded-xl cursor-pointer transition-colors ${addRiderForm.storeIds.includes(s.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={addRiderForm.storeIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAddRiderForm({ ...addRiderForm, storeIds: [...addRiderForm.storeIds, s.id] });
                              } else {
                                setAddRiderForm({ ...addRiderForm, storeIds: addRiderForm.storeIds.filter(id => id !== s.id) });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="truncate font-semibold text-gray-700">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsAddRiderOpen(false)}
                      className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl text-gray-700"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md">
                      Create Credentials
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Rider Modal */}
          {editingRider && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-bold text-on-surface">Edit Rider Credentials &amp; Store</h3>
                  <button onClick={() => setEditingRider(null)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editRiderForm.name}
                      onChange={(e) => setEditRiderForm({ ...editRiderForm, name: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Email</label>
                    <input
                      type="email"
                      value={editRiderForm.email}
                      onChange={(e) => setEditRiderForm({ ...editRiderForm, email: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Phone</label>
                    <input
                      type="text"
                      value={editRiderForm.phone}
                      onChange={(e) => setEditRiderForm({ ...editRiderForm, phone: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Assigned Store Hubs (Multiple Allowed)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-1">
                      {stores.map((s) => (
                        <label key={s.id} className={`flex items-center gap-2 text-sm p-2.5 border rounded-xl cursor-pointer transition-colors ${editRiderForm.storeIds.includes(s.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={editRiderForm.storeIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditRiderForm({ ...editRiderForm, storeIds: [...editRiderForm.storeIds, s.id] });
                              } else {
                                setEditRiderForm({ ...editRiderForm, storeIds: editRiderForm.storeIds.filter(id => id !== s.id) });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="truncate font-semibold text-gray-700">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">New Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={editRiderForm.password}
                      onChange={(e) => setEditRiderForm({ ...editRiderForm, password: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t">
                  <button onClick={() => setEditingRider(null)} className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl">Cancel</button>
                  <button onClick={saveRider} className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Edit Modal */}
          {editingCustomer && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-bold text-on-surface">Edit Customer Details</h3>
                  <button onClick={() => setEditingCustomer(null)} className="text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase text-outline mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingCustomer(null)} className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl">Cancel</button>
                  <button onClick={saveCustomer} className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ ORDER HISTORY MODAL ══════════ */}
          {selectedHistoryOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Order Lifecycle Timeline</h2>
                    <p className="text-sm text-outline font-mono">Order #{String(selectedHistoryOrder.id).padStart(4, "0")}</p>
                  </div>
                  <button onClick={() => setSelectedHistoryOrder(null)} className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-low">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
                    {/* Created */}
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-sm" />
                      <p className="text-xs font-bold text-outline uppercase">Order Placed</p>
                      <p className="text-sm text-on-surface font-semibold">
                        {new Date(selectedHistoryOrder.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="text-xs text-outline">Customer: {selectedHistoryOrder.customer.name}</p>
                    </div>

                    {/* Picked Up */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedHistoryOrder.pickedUpAt ? 'bg-primary' : 'bg-outline/30'}`} />
                      <p className="text-xs font-bold text-outline uppercase">Picked Up by Rider</p>
                      {selectedHistoryOrder.pickedUpAt ? (
                        <>
                          <p className="text-sm text-on-surface font-semibold">
                            {new Date(selectedHistoryOrder.pickedUpAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs text-outline">Rider: {selectedHistoryOrder.rider?.name || 'Unknown'}</p>
                        </>
                      ) : (
                        <p className="text-sm text-outline italic">Pending...</p>
                      )}
                    </div>

                    {/* Received at Store */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedHistoryOrder.receivedAtStoreAt ? 'bg-primary' : 'bg-outline/30'}`} />
                      <p className="text-xs font-bold text-outline uppercase">Received at Store Hub</p>
                      {selectedHistoryOrder.receivedAtStoreAt ? (
                        <p className="text-sm text-on-surface font-semibold">
                          {new Date(selectedHistoryOrder.receivedAtStoreAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      ) : (
                        <p className="text-sm text-outline italic">Pending...</p>
                      )}
                    </div>

                    {/* Ready for Delivery */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedHistoryOrder.readyForDeliveryAt ? 'bg-primary' : 'bg-outline/30'}`} />
                      <p className="text-xs font-bold text-outline uppercase">Ready for Delivery</p>
                      {selectedHistoryOrder.readyForDeliveryAt ? (
                        <p className="text-sm text-on-surface font-semibold">
                          {new Date(selectedHistoryOrder.readyForDeliveryAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      ) : (
                        <p className="text-sm text-outline italic">Pending...</p>
                      )}
                    </div>

                    {/* Delivered */}
                    <div className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${selectedHistoryOrder.deliveredAt ? 'bg-emerald-500' : 'bg-outline/30'}`} />
                      <p className="text-xs font-bold text-outline uppercase">Delivered & Complete</p>
                      {selectedHistoryOrder.deliveredAt ? (
                        <>
                          <p className="text-sm text-on-surface font-semibold">
                            {new Date(selectedHistoryOrder.deliveredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs text-outline">Delivered by: {selectedHistoryOrder.deliveryRider?.name || selectedHistoryOrder.rider?.name || 'Unknown'}</p>
                        </>
                      ) : (
                        <p className="text-sm text-outline italic">Pending...</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedHistoryOrder(null)}
                      className="px-6 py-2 bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-variant transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
