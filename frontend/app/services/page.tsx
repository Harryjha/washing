"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "../../components/ProfileDropdown";
import dynamic from "next/dynamic";

const CustomerLocationPicker = dynamic(
  () => import("../../components/CustomerLocationPicker"),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-3xl" /> }
);

// ─── Service Data ─────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "wash-and-fold",
    label: "Wash & Fold",
    icon: "local_laundry_service",
    heroColor: "bg-[#29B6F6]",
    textColor: "text-white",
    accentColor: "text-primary",
    borderColor: "border-primary",
    bgAccent: "bg-primary",
    price: "₹79",
    unit: "/ KG",
    delivery: "1 Day",
    badge: "bg-white/20 text-white",
    description: "Professional laundry service cleaned to perfection for your daily essentials. We sort, wash, dry, and neatly fold your clothes back into shape.",
    features: ["Expert Sorting", "Premium Detergents", "Neat Folding", "Fabric Care Check"],
    featureIcon: "check_circle",
    minBilling: "Rs 349",
    hasItemSelector: false,
    clothingTypes: [],
  },
  {
    id: "wash-and-ironing",
    label: "Wash & Iron",
    icon: "iron",
    heroColor: "bg-[#26A69A]",
    textColor: "text-white",
    accentColor: "text-secondary",
    borderColor: "border-secondary",
    bgAccent: "bg-secondary",
    price: "₹120",
    unit: "/ KG",
    delivery: "2 Days",
    badge: "bg-white/20 text-white",
    description: "Expertly washed and precision steam-pressed for a crisp, professional finish. Perfect for office wear and formal clothing.",
    features: ["Steam Ironing", "Stain Removal", "Crease-Free Guarantee"],
    featureIcon: "check_circle",
    minBilling: "Rs 349",
    hasItemSelector: false,
    clothingTypes: [],
  },
  {
    id: "premium-laundry",
    label: "Premium Laundry",
    icon: "verified",
    heroColor: "bg-[#5C6BC0]",
    textColor: "text-white",
    accentColor: "text-on-secondary-container",
    borderColor: "border-secondary-container",
    bgAccent: "bg-secondary-container",
    price: "₹199",
    unit: "/ KG",
    delivery: "Same Day",
    badge: "bg-white/20 text-white",
    description: "Our highest level of care with individual garment protection and priority treatment. Each item is handled separately and packed individually.",
    features: ["Individual Protection", "Individual Packing", "Priority Pickup", "Same-Day Delivery"],
    featureIcon: "verified",
    minBilling: "Rs 349",
    hasItemSelector: false,
    clothingTypes: [],
  },
  {
    id: "dry-cleaning",
    label: "Dry Cleaning",
    icon: "dry_cleaning",
    heroColor: "bg-[#D84315]",
    textColor: "text-white",
    accentColor: "text-tertiary",
    borderColor: "border-tertiary",
    bgAccent: "bg-tertiary",
    price: "From ₹119",
    unit: "/ ITEM",
    delivery: "4 Days",
    badge: "bg-white/20 text-white",
    description: "Specialized waterless solvent cleaning for delicate fabrics. Ideal for designer garments and luxury fabrics. 4 Days (Excluding Pickup day).",
    features: ["Waterless Solvent", "Designer Garment Care", "Premium Finishing", "Fabric Analysis"],
    featureIcon: "spa",
    minBilling: "Rs 349",
    hasItemSelector: true,
    clothingTypes: [],
  },
  {
    id: "household-laundry",
    label: "Household Laundry",
    icon: "bed",
    heroColor: "bg-[#388E3C]",
    textColor: "text-white",
    accentColor: "text-primary",
    borderColor: "border-primary",
    bgAccent: "bg-primary",
    price: "₹169",
    unit: "/ ITEM",
    delivery: "Standard",
    badge: "bg-white/20 text-white",
    description: "Bulk care for your home essentials. Deep-cleaned, sanitized, and delivered fresh. Perfect for duvets, blankets, curtains, and bed linen.",
    features: ["Duvets & Blankets", "Bedsheets & Pillows", "Deep Sanitization", "Anti-allergen Wash"],
    featureIcon: "home",
    minBilling: "Rs 349",
    hasItemSelector: true,
    clothingTypes: ["Duvets", "Blankets", "Bed Sheets", "Pillow Covers", "Curtains", "Sofa Covers", "Table Covers", "Towels"],
  },
  {
    id: "express-service",
    label: "Express Service",
    icon: "bolt",
    heroColor: "bg-[#F57C00]",
    textColor: "text-white",
    accentColor: "text-secondary",
    borderColor: "border-secondary",
    bgAccent: "bg-secondary",
    price: "₹249",
    unit: "/ KG",
    delivery: "6 Hours",
    badge: "bg-white/20 text-white",
    description: "Rapid turnaround when time is of the essence. We guarantee the fastest possible processing and delivery — all within 6 hours.",
    features: ["Super Fast Processing", "Express Delivery", "Guaranteed Quality", "Priority Handling"],
    featureIcon: "bolt",
    minBilling: "Rs 599",
    hasItemSelector: false,
    clothingTypes: [],
  },
];

const CLOTHING_ICONS: Record<string, string> = {
  "Duvets": "bed", "Blankets": "bed", "Bed Sheets": "bed",
  "Pillow Covers": "bed", "Curtains": "curtains", "Sofa Covers": "weekend",
  "Table Covers": "table_restaurant", "Towels": "dry",
};

// ─── Dry Cleaning Sub-Categories ──────────────────────────────────────────────
const DRY_CLEANING_CATEGORIES = {
  mens: [
    { name: "Shirt/T-shirt", price: 119 },
    { name: "Trouser/Jeans", price: 119 },
    { name: "Suit (2 Pcs - Blazer & Trouser)", price: 349 },
    { name: "Suit (3 Pcs - Blazer, Trouser & Shirt)", price: 399 },
    { name: "Kurta", price: 149 },
    { name: "Kurta (Fancy)", price: 199 },
    { name: "Sherwani", price: 600 },
    { name: "Payjama", price: 119 },
    { name: "Coat", price: 300 },
    { name: "Jacket/Blazer", price: 299 },
    { name: "Waist Coat/Half Coat", price: 199 },
    { name: "Overcoat", price: 350 },
    { name: "Leather Jacket", price: 500 },
    { name: "Sweater/Pullover", price: 199 },
    { name: "Dhoti", price: 250 },
  ],
  womens: [
    { name: "Top/Bottom (Light)", price: 149 },
    { name: "Lehenga (Plain)", price: 350 },
    { name: "Lehenga (Heavy)", price: 750 },
    { name: "Saree (Cotton)", price: 249 },
    { name: "Saree (Silk)", price: 299 },
    { name: "Saree (Fancy)", price: 350 },
    { name: "Skirt", price: 130 },
    { name: "Blouse", price: 149 },
    { name: "Blouse (Fancy)", price: 200 },
    { name: "Long Dress/Jump Suit", price: 300 },
    { name: "Shawl", price: 150 },
    { name: "Gown", price: 500 },
    { name: "Jacket/Blazer", price: 299 },
    { name: "Waist Coat/Half Coat", price: 199 },
    { name: "Overcoat", price: 350 },
    { name: "Leather Jacket", price: 500 },
    { name: "Sweater/Pullover", price: 199 },
    { name: "Kurta", price: 149 },
    { name: "Kurta (Fancy)", price: 199 },
    { name: "Dupatta", price: 149 },
    { name: "Dupatta (Fancy)", price: 200 },
  ],
  others: [
    { name: "Blanket/Quilt/Comforter (Single)", price: 300, unit: "/item" },
    { name: "Blanket/Quilt/Comforter (Double)", price: 399, unit: "/item" },
    { name: "Bed Sheet (Single)", price: 150, unit: "/item" },
    { name: "Bed Sheet (Double)", price: 200, unit: "/item" },
    { name: "Door Mat", price: 150, unit: "/item" },
    { name: "Sofa Cover", price: 150, unit: "/item" },
    { name: "Single Blanket / Quilt", price: 249, icon: "bed" },
    { name: "Double Blanket / Heavy Quilt", price: 399, icon: "bed" },
    { name: "Bedspread / Bedcover", price: 199, icon: "bed" },
    { name: "Curtain (per panel)", price: 149, icon: "curtains" },
    { name: "Carpet / Rug (small)", price: 299, icon: "texture" },
    { name: "Cushion Cover (Set of 4)", price: 119, icon: "chair" },
  ],
} as const;

type DryCleaningTab = "mens" | "womens" | "others";

// ─── Component ────────────────────────────────────────────────────────────────
function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceParam = searchParams.get("service");
  const initialService = SERVICES.find(s => s.id === serviceParam) || SERVICES[0];

  const [activeService, setActiveService] = useState(initialService);
  const [selectedClothes, setSelectedClothes] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState("");
  const [address, setAddress] = useState("");
  const [pickupLat, setPickupLat] = useState<number | undefined>(undefined);
  const [pickupLng, setPickupLng] = useState<number | undefined>(undefined);
  const [pickupLandmark, setPickupLandmark] = useState<string>("");
  const [specialNote, setSpecialNote] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dryCleaningTab, setDryCleaningTab] = useState<DryCleaningTab>("mens");

  useEffect(() => {
    const svc = SERVICES.find(s => s.id === serviceParam);
    if (svc) setActiveService(svc);

    // Pre-fill from Home Hero Quick Pickup form if available
    if (typeof window !== "undefined") {
      const quick = localStorage.getItem("quickPickupData");
      if (quick) {
        try {
          const { pickupDate: qDate, pickupAddress: qAddr } = JSON.parse(quick);
          if (qDate) setPickupDate(qDate);
          if (qAddr) setAddress(qAddr);
          localStorage.removeItem("quickPickupData");
        } catch {}
      }
    }

    if (searchParams.get("orderSuccess") === "true") {
      setOrderSubmitted(true);
      setTimeout(() => setOrderSubmitted(false), 5000);
    }
  }, [serviceParam, searchParams]);

  const toggleCloth = (cloth: string) => {
    setSelectedClothes((prev) => {
      if (prev[cloth]) {
        const next = { ...prev };
        delete next[cloth];
        return next;
      }
      return { ...prev, [cloth]: 1 };
    });
  };

  const updateCount = (cloth: string, delta: number) => {
    setSelectedClothes((prev) => {
      const next = Math.max(0, (prev[cloth] || 0) + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[cloth];
        return copy;
      }
      return { ...prev, [cloth]: next };
    });
  };

  const totalItems = Object.values(selectedClothes).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    const itemsDescription = Object.keys(selectedClothes).length > 0
      ? Object.entries(selectedClothes).map(([name, qty]) => `${name} ×${qty}`).join(", ")
      : activeService.label;

    const payload = {
      serviceType: activeService.label,
      itemsDescription,
      pickupAddress: address,
      pickupLatitude: pickupLat,
      pickupLongitude: pickupLng,
      pickupLandmark: pickupLandmark || null,
      pickupDate: pickupDate || null,
      specialNote: specialNote || null,
    };

    // If not logged in, lock current order data & redirect to login for seamless order placement
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("pendingOrderData", JSON.stringify(payload));
      }
      router.push("/login?redirect=/services?service=" + activeService.id);
      return;
    }

    if (user.role !== "CUSTOMER") {
      setOrderError("Only customer accounts can place orders.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setOrderError(err.error || "Failed to place order. Please try again.");
        return;
      }

      // Success
      setOrderSubmitted(true);
      setTimeout(() => setOrderSubmitted(false), 5000);
      setSelectedClothes({});
      setPickupDate("");
      setAddress("");
      setSpecialNote("");
    } catch {
      setOrderError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchService = (svc: typeof SERVICES[0]) => {
    setActiveService(svc);
    setSelectedClothes({});
    setOrderError("");
  };

  // Step numbers depend on whether service has item selector
  const pickupStep = activeService.hasItemSelector ? "2" : "1";
  const instructionsStep = activeService.hasItemSelector ? "3" : "2";

  return (
    <div className="bg-background text-on-background overflow-x-hidden min-h-screen">

      {/* ─── Top Nav ─── */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1200px] mx-auto">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Washington Laundrettes" className="h-[64px] md:h-[80px] w-auto max-w-[320px] object-contain object-left" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-primary font-bold border-b-2 border-primary pb-1">Services</Link>
            <Link href="/#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors">How it Works</Link>
            <Link href="/#main-pricing" className="text-on-surface-variant hover:text-primary transition-colors">Pricing</Link>
            <Link href="/#testimonials" className="text-on-surface-variant hover:text-primary transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/services" className="hidden sm:block bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-sm">Schedule Pickup</Link>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-primary font-semibold px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">Log In</Link>
                <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all">Schedule Pickup</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Sidebar + Main ─── */}
      <div className="flex min-h-screen pt-20">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-0 top-20 bottom-0 bg-surface border-r border-outline-variant/30 z-40 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-6 px-4">Service Categories</h3>
            <nav className="space-y-1">
              {SERVICES.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => switchService(svc)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeService.id === svc.id
                      ? "bg-primary/10 text-primary border-r-4 border-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeService.id === svc.id ? "text-primary" : "text-on-surface-variant/60 group-hover:text-on-surface-variant"}`}>
                    {svc.icon}
                  </span>
                  <span className="font-semibold text-sm">{svc.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-outline-variant/20">
            <div className="bg-primary-container/10 p-4 rounded-xl">
              <p className="text-[12px] font-bold text-primary mb-2">NEED HELP?</p>
              <p className="text-[12px] text-on-surface-variant mb-3">Our concierge is available 24/7 for special care requests.</p>
              <button className="text-[12px] font-bold text-primary hover:underline">Contact Support →</button>
            </div>
          </div>
        </aside>

        {/* Mobile bottom tab bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant/30 flex overflow-x-auto no-scrollbar">
          {SERVICES.map((svc) => (
            <button
              key={svc.id}
              onClick={() => switchService(svc)}
              className={`flex-none flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                activeService.id === svc.id ? "text-primary border-t-2 border-primary bg-primary/5" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
              <span className="text-[9px] font-bold uppercase leading-tight text-center">{svc.label.split(" ").slice(0, 2).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* ─── Main Content ─── */}
        <main className="flex-1 lg:ml-72 w-full pb-24 lg:pb-0">

          {/* ── Service Hero ── */}
          <section className={`${activeService.heroColor} text-white py-12 relative overflow-hidden transition-all duration-500`}>
            <div className="max-w-4xl mx-auto px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">

                {/* Icon */}
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-[48px]">{activeService.icon}</span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <span className="text-[12px] font-bold text-white/80 uppercase tracking-widest mb-2 block">Selected Service</span>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{activeService.label}</h1>
                  <p className="text-white/90 text-sm md:text-base max-w-xl">{activeService.description}</p>
                  <div className="flex flex-wrap gap-3 mt-5">
                    {activeService.features.map((f) => (
                      <span key={f} className="bg-white/20 px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">{activeService.featureIcon}</span>{f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Card */}
                <div className="bg-white rounded-2xl p-6 text-on-surface shadow-xl border border-white/20 min-w-[200px] text-center flex-shrink-0">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Starting At</p>
                  <p className={`text-4xl font-black mb-1 ${activeService.accentColor}`}>
                    {activeService.price}
                    <span className="text-lg text-on-surface-variant font-normal"> {activeService.unit}</span>
                  </p>
                  <div className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded text-center mb-3 uppercase">
                    Delivery: {activeService.delivery}
                  </div>
                  <p className="text-[10px] text-outline">Min. billing: {activeService.minBilling}</p>
                </div>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          </section>

          {/* ── Order Form ── */}
          <section className="py-12 bg-surface-container-low/30 min-h-[500px]">
            <div className="max-w-4xl mx-auto px-8">

              {/* Success Banner */}
              {orderSubmitted && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                  <span className="material-symbols-outlined text-green-600 text-[36px]">check_circle</span>
                  <div>
                    <p className="font-bold text-green-800">Order Placed Successfully!</p>
                    <p className="text-green-600 text-sm">We'll confirm your pickup details via SMS shortly. View it in your <Link href="/customer" className="underline font-semibold">My Orders</Link>.</p>
                  </div>
                </div>
              )}

              {/* Not-Logged-In Gate */}
              {!user && (
                <div className="mb-8 bg-primary/5 border-2 border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-[36px]">lock</span>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-on-surface">Sign in to place an order</p>
                    <p className="text-on-surface-variant text-sm mt-1">You need to be logged in as a customer to schedule a pickup.</p>
                  </div>
                  <Link
                    href={`/login?redirect=/services?service=${activeService.id}`}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md flex-shrink-0"
                  >
                    Log In
                  </Link>
                </div>
              )}

              {/* Error Banner */}
              {orderError && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600">error</span>
                  <p className="text-red-700 text-sm font-semibold">{orderError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* ── Step: Select Clothing Types (only for dry-cleaning and household-laundry) ── */}
                {activeService.hasItemSelector && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-10 h-10 ${activeService.bgAccent} text-white rounded-full flex items-center justify-center font-bold text-lg`}>1</div>
                      <h2 className="text-2xl font-bold text-on-surface">
                        Select Clothing Types
                        {totalItems > 0 && (
                          <span className={`ml-3 text-sm font-bold ${activeService.accentColor} bg-primary/10 px-3 py-1 rounded-full`}>
                            {totalItems} selected
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Dry Cleaning Sub-tabs */}
                    {activeService.id === "dry-cleaning" ? (
                      <div>
                        <div className="flex gap-2 mb-6 bg-surface-container-low rounded-2xl p-1.5 w-fit">
                          {(["mens", "womens", "others"] as DryCleaningTab[]).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => { setDryCleaningTab(tab); setSelectedClothes({}); }}
                              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                                dryCleaningTab === tab ? "bg-tertiary text-white shadow-md" : "text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {tab === "mens" ? "Men's" : tab === "womens" ? "Women's" : "Others"}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Waterless Solvent</span>
                          <span className="bg-surface-container-low text-on-surface-variant rounded-full px-4 py-1.5 text-xs font-bold">4 Days (Excluding Pickup day)</span>
                          <span className="bg-tertiary/10 text-tertiary rounded-full px-4 py-1.5 text-xs font-bold">Min. billing: Rs 349</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                          <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            <span>Item</span>
                            <span>Price</span>
                          </div>
                          <div className="divide-y divide-outline-variant/15">
                            {DRY_CLEANING_CATEGORIES[dryCleaningTab].map((item) => {
                              const isSelected = !!selectedClothes[item.name];
                              const count = selectedClothes[item.name] || 0;
                              return (
                                <div
                                  key={item.name}
                                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors duration-150 ${isSelected ? "bg-tertiary/5" : "hover:bg-surface-container-low"}`}
                                  onClick={() => toggleCloth(item.name)}
                                >
                                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-tertiary border-tertiary" : "border-outline-variant"}`}>
                                    {isSelected && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                                  </div>
                                  <span className={`flex-1 font-medium text-sm ${isSelected ? "text-tertiary font-bold" : "text-on-surface"}`}>{item.name}</span>
                                  {isSelected && (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <button type="button" onClick={() => updateCount(item.name, -1)} className="w-7 h-7 rounded-full bg-white border border-outline-variant flex items-center justify-center font-bold text-lg leading-none hover:bg-surface-container-low transition-colors">−</button>
                                      <span className="font-black text-base text-tertiary w-5 text-center">{count}</span>
                                      <button type="button" onClick={() => updateCount(item.name, 1)} className="w-7 h-7 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-lg leading-none hover:opacity-90 transition-colors">+</button>
                                    </div>
                                  )}
                                  <span className={`flex-shrink-0 font-bold text-sm text-right min-w-[80px] ${isSelected ? "text-tertiary" : "text-on-surface"}`}>
                                    ₹{item.price}{(item as any).unit ? <span className="font-normal text-on-surface-variant text-xs">{(item as any).unit}</span> : ""}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Household Laundry grid */
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {activeService.clothingTypes.map((cloth) => {
                          const isSelected = !!selectedClothes[cloth];
                          const count = selectedClothes[cloth] || 0;
                          return (
                            <div
                              key={cloth}
                              className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                                isSelected ? `${activeService.borderColor} bg-primary/5 shadow-md` : "border-outline-variant/30 bg-white hover:border-primary/30 hover:shadow-sm"
                              }`}
                              onClick={() => toggleCloth(cloth)}
                            >
                              <div className="p-4 flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? activeService.bgAccent : "bg-primary/5"}`}>
                                  <span className={`material-symbols-outlined text-[24px] ${isSelected ? "text-white" : activeService.accentColor}`}>
                                    {CLOTHING_ICONS[cloth] || "checkroom"}
                                  </span>
                                </div>
                                <span className={`text-xs font-bold text-center leading-tight ${isSelected ? activeService.accentColor : "text-on-surface-variant"}`}>{cloth}</span>
                              </div>
                              {isSelected && (
                                <div className="flex items-center justify-between px-2 pb-3" onClick={(e) => e.stopPropagation()}>
                                  <button type="button" onClick={() => updateCount(cloth, -1)} className="w-7 h-7 rounded-full bg-white border border-outline-variant flex items-center justify-center font-bold text-lg leading-none">−</button>
                                  <span className={`font-black text-base ${activeService.accentColor}`}>{count}</span>
                                  <button type="button" onClick={() => updateCount(cloth, 1)} className={`w-7 h-7 rounded-full ${activeService.bgAccent} text-white flex items-center justify-center font-bold text-lg leading-none`}>+</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step: Pickup Details ── */}
                <div className="space-y-6">
                  {/* Interactive Map Location Picker */}
                  <CustomerLocationPicker
                    initialAddress={address}
                    onLocationSelect={({ latitude, longitude, address: newAddr, landmark }: { latitude: number; longitude: number; address: string; landmark?: string }) => {
                      setPickupLat(latitude);
                      setPickupLng(longitude);
                      setAddress(newAddr);
                      if (landmark) setPickupLandmark(landmark);
                    }}
                  />

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-10 h-10 ${activeService.bgAccent} text-white rounded-full flex items-center justify-center font-bold text-lg`}>{pickupStep}</div>
                      <h2 className="text-2xl font-bold text-on-surface">Pickup Date &amp; Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface-variant" htmlFor="pickup-date">Preferred Pickup Date</label>
                        <div className="relative">
                          <input
                            id="pickup-date"
                            type="date"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface-variant" htmlFor="pickup-address">Confirmed Address Line</label>
                        <div className="relative">
                          <input
                            id="pickup-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter or adjust your full address"
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Step: Special Instructions ── */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-10 h-10 ${activeService.bgAccent} text-white rounded-full flex items-center justify-center font-bold text-lg`}>{instructionsStep}</div>
                    <h2 className="text-2xl font-bold text-on-surface">
                      Special Instructions{" "}
                      <span className="text-sm font-normal text-outline ml-1">(Optional)</span>
                    </h2>
                  </div>
                  <textarea
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder="e.g. Handle with care, avoid bleach on dark clothes, fold shirts in pairs..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-[160px] resize-none"
                  />
                </div>

                {/* ── Order Summary (only when items selected, for services with item selector) ── */}
                {activeService.hasItemSelector && totalItems > 0 && (
                  <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-md p-6">
                    <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">receipt_long</span> Order Summary
                    </h3>
                    <div className="space-y-2 mb-6">
                      {Object.entries(selectedClothes).map(([cloth, count]) => {
                        const dcItem = activeService.id === "dry-cleaning"
                          ? DRY_CLEANING_CATEGORIES[dryCleaningTab].find(i => i.name === cloth)
                          : null;
                        return (
                          <div key={cloth} className="flex justify-between text-sm">
                            <span className="text-on-surface-variant">{cloth} × {count}</span>
                            {dcItem
                              ? <span className={`font-bold ${activeService.accentColor}`}>₹{dcItem.price * count}</span>
                              : <span className={`font-bold ${activeService.accentColor}`}>× {count}</span>
                            }
                          </div>
                        );
                      })}
                      {activeService.id === "dry-cleaning" && (() => {
                        const total = Object.entries(selectedClothes).reduce((sum, [cloth, count]) => {
                          const item = DRY_CLEANING_CATEGORIES[dryCleaningTab].find(i => i.name === cloth);
                          return sum + (item ? item.price * count : 0);
                        }, 0);
                        return total > 0 ? (
                          <div className="border-t border-outline-variant/30 pt-3 mt-3 flex justify-between font-bold">
                            <span>Estimated Total</span>
                            <span className="text-tertiary">₹{Math.max(total, 349)}{total < 349 ? " (min. Rs 349)" : ""}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="border-t border-outline-variant/30 pt-3 mt-3 flex justify-between font-bold">
                        <span>Total Items</span>
                        <span className={activeService.accentColor}>{totalItems} pieces</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Submit Button ── */}
                <div className="flex flex-col items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full max-w-md ${activeService.bgAccent} text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:opacity-90 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order…
                      </>
                    ) : !user ? (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        Log In to Place Order
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">shopping_cart_checkout</span>
                        Confirm Pickup & Order
                      </>
                    )}
                  </button>
                  <p className="text-sm text-outline text-center max-w-sm">
                    By placing an order, you agree to our Terms of Service. Final billing will be calculated after weighing.
                  </p>
                </div>

              </form>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="w-full py-12 bg-inverse-surface text-white border-t border-outline-variant/20">
            <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-2">
                <img src="/logo.png" alt="Washington Laundrettes" className="h-12 w-auto object-contain object-left invert" />
                <p className="text-white/60 text-sm max-w-xs text-center md:text-left">Premium garment care and laundry services delivered to your doorstep.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                <a className="text-sm text-white/80 hover:text-white hover:underline transition-colors" href="#">Privacy Policy</a>
                <a className="text-sm text-white/80 hover:text-white hover:underline transition-colors" href="#">Terms of Service</a>
                <a className="text-sm text-white/80 hover:text-white hover:underline transition-colors" href="#">Contact Us</a>
              </div>
              <div className="text-white/60 text-sm">© 2024 Washington Laundry.</div>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary font-bold text-xl">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
