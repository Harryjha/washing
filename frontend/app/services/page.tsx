"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Service Data ────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "wash-and-fold",
    label: "Wash And Fold",
    icon: "local_laundry_service",
    color: "bg-primary-container",
    textColor: "text-on-primary-container",
    accentColor: "text-primary",
    borderColor: "border-primary",
    bgAccent: "bg-primary",
    price: "₹80",
    unit: "/ KG",
    delivery: "1 Day",
    badge: "bg-primary-fixed/30 text-on-primary-fixed",
    description: "Professional laundry service cleaned to perfection for your daily essentials. We sort, wash, dry, and neatly fold your clothes back into shape.",
    features: ["Expert Sorting", "Premium Detergents", "Neat Folding", "Fabric Care Check"],
    featureIcon: "check_circle",
    clothingTypes: ["T-Shirts", "Shirts", "Trousers", "Jeans", "Undergarments", "Socks", "Shorts", "Sarees", "Kurtas", "Kids Clothes"],
  },
  {
    id: "wash-and-ironing",
    label: "Wash And Ironing",
    icon: "iron",
    color: "bg-secondary",
    textColor: "text-on-secondary",
    accentColor: "text-secondary",
    borderColor: "border-secondary",
    bgAccent: "bg-secondary",
    price: "₹120",
    unit: "/ KG",
    delivery: "2 Days",
    badge: "bg-secondary-fixed/50 text-on-secondary-fixed-variant",
    description: "Expertly washed and precision steam-pressed for a crisp, professional finish. Perfect for office wear and formal clothing.",
    features: ["Steam Ironing", "Hanger Service", "Stain Removal", "Crease-Free Guarantee"],
    featureIcon: "check_circle",
    clothingTypes: ["Formal Shirts", "Dress Pants", "Blazers", "Sarees", "Kurtas", "School Uniforms", "Suits", "Ethnic Wear"],
  },
  {
    id: "premium-laundry",
    label: "Premium Laundry",
    icon: "verified",
    color: "bg-secondary-container",
    textColor: "text-on-secondary-container",
    accentColor: "text-on-secondary-container",
    borderColor: "border-secondary-container",
    bgAccent: "bg-secondary-container",
    price: "₹199",
    unit: "/ KG",
    delivery: "Same Day",
    badge: "bg-secondary-container/20 text-on-secondary-container",
    description: "Our highest level of care with individual garment protection and priority treatment. Each item is handled separately and packed individually.",
    features: ["Individual Protection", "Individual Packing", "Priority Pickup", "Same-Day Delivery"],
    featureIcon: "verified",
    clothingTypes: ["Designer Wear", "Silk Garments", "Cashmere", "Formal Suits", "Wedding Clothes", "Embroidered Wear", "Linen Shirts"],
  },
  {
    id: "dry-cleaning",
    label: "Dry Cleaning",
    icon: "dry_cleaning",
    color: "bg-tertiary",
    textColor: "text-on-tertiary",
    accentColor: "text-tertiary",
    borderColor: "border-tertiary",
    bgAccent: "bg-tertiary",
    price: "₹99",
    unit: "/ ITEM",
    delivery: "4 Days",
    badge: "bg-tertiary/10 text-tertiary",
    description: "Specialized solvent-based cleaning for delicate fabrics that cannot be washed with water. Ideal for designer garments and luxury fabrics.",
    features: ["Eco-friendly Solvents", "Designer Garment Care", "Premium Finishing", "Fabric Analysis"],
    featureIcon: "spa",
    clothingTypes: ["Woolen Coats", "Leather Jackets", "Silk Dresses", "Bridal Wear", "Suits & Blazers", "Ties & Scarves", "Embroidered Clothes"],
  },
  {
    id: "household-laundry",
    label: "Household Laundry",
    icon: "bed",
    color: "bg-primary",
    textColor: "text-on-primary",
    accentColor: "text-primary",
    borderColor: "border-primary",
    bgAccent: "bg-primary",
    price: "₹169",
    unit: "/ ITEM",
    delivery: "Standard",
    badge: "bg-primary-fixed/30 text-on-primary-fixed",
    description: "Bulk care for your home essentials. Deep-cleaned, sanitized, and delivered fresh. Perfect for duvets, blankets, curtains, and bed linen.",
    features: ["Duvets & Blankets", "Bedsheets & Pillows", "Deep Sanitization", "Anti-allergen Wash"],
    featureIcon: "home",
    clothingTypes: ["Duvets", "Blankets", "Bed Sheets", "Pillow Covers", "Curtains", "Sofa Covers", "Table Covers", "Towels"],
  },
  {
    id: "express-service",
    label: "Express Service",
    icon: "bolt",
    color: "bg-secondary",
    textColor: "text-on-secondary",
    accentColor: "text-secondary",
    borderColor: "border-secondary",
    bgAccent: "bg-secondary",
    price: "₹249",
    unit: "/ KG",
    delivery: "6 Hours",
    badge: "bg-error/10 text-error",
    description: "Rapid turnaround when time is of the essence. We guarantee the fastest possible processing and delivery — all within 6 hours.",
    features: ["Super Fast Processing", "Express Delivery", "Guaranteed Quality", "Priority Handling"],
    featureIcon: "bolt",
    clothingTypes: ["T-Shirts", "Shirts", "Trousers", "Jeans", "Ethnic Wear", "Sarees", "Formal Wear"],
  },
];

const CLOTHING_ICONS: Record<string, string> = {
  "T-Shirts": "checkroom", "Shirts": "checkroom", "Formal Shirts": "checkroom", "Trousers": "style",
  "Jeans": "style", "Dress Pants": "style", "Undergarments": "checkroom", "Socks": "checkroom",
  "Shorts": "checkroom", "Sarees": "checkroom", "Ethnic Wear": "checkroom", "Kurtas": "checkroom",
  "Kids Clothes": "child_care", "Blazers": "checkroom", "School Uniforms": "checkroom", "Suits": "checkroom",
  "Formal Suits": "checkroom", "Wedding Clothes": "checkroom", "Silk Garments": "checkroom",
  "Designer Wear": "star", "Cashmere": "checkroom", "Embroidered Wear": "auto_awesome",
  "Linen Shirts": "checkroom", "Woolen Coats": "checkroom", "Leather Jackets": "checkroom",
  "Silk Dresses": "checkroom", "Bridal Wear": "favorite", "Ties & Scarves": "checkroom",
  "Embroidered Clothes": "auto_awesome", "Duvets": "bed", "Blankets": "bed", "Bed Sheets": "bed",
  "Pillow Covers": "bed", "Curtains": "curtains", "Sofa Covers": "weekend", "Table Covers": "table_restaurant",
  "Towels": "dry", "Suits & Blazers": "checkroom",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const initialService = SERVICES.find(s => s.id === serviceParam) || SERVICES[0];

  const [activeService, setActiveService] = useState(initialService);
  const [selectedClothes, setSelectedClothes] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState("");
  const [address, setAddress] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Update active service if URL changes
  useEffect(() => {
    const svc = SERVICES.find(s => s.id === serviceParam);
    if (svc) setActiveService(svc);
  }, [serviceParam]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    setTimeout(() => setOrderSubmitted(false), 4000);
    setSelectedClothes({});
    setPickupDate("");
    setAddress("");
    setSpecialNote("");
  };

  const switchService = (svc: typeof SERVICES[0]) => {
    setActiveService(svc);
    setSelectedClothes({});
  };

  return (
    <div className="bg-background text-on-background overflow-x-hidden min-h-screen">

      {/* ─── Top Nav ─── */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1200px] mx-auto">
          <Link href="/" className="flex items-center">
            <img src="/brand-logo.png" alt="Washington Laundrettes" className="h-[48px] md:h-[60px] w-auto max-w-[280px] object-contain object-left" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-primary font-bold border-b-2 border-primary pb-1">Services</Link>
            <Link href="/#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors">How it Works</Link>
            <Link href="/#main-pricing" className="text-on-surface-variant hover:text-primary transition-colors">Pricing</Link>
            <Link href="/#testimonials" className="text-on-surface-variant hover:text-primary transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-primary font-semibold px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">Log In</Link>
            <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all">Schedule Pickup</Link>
          </div>
        </div>
      </header>

      {/* ─── Sidebar + Main ─── */}
      <div className="flex min-h-screen pt-20">

        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-0 top-20 bottom-0 bg-surface border-r border-outline-variant/30 z-40 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-6">Service Categories</h3>
            <nav className="space-y-1">
              {SERVICES.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => switchService(svc)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeService.id === svc.id
                      ? `${svc.bgAccent} text-white shadow-md`
                      : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeService.id === svc.id ? "text-white" : svc.accentColor}`}>
                    {svc.icon}
                  </span>
                  <span className="font-semibold text-sm">{svc.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-outline-variant/20">
            <div className="bg-primary-container/10 p-4 rounded-xl">
              <p className="text-[12px] font-bold text-primary mb-1">NEED HELP?</p>
              <p className="text-[12px] text-on-surface-variant mb-3">Our concierge is available 24/7.</p>
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
              className={`flex-none flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${activeService.id === svc.id ? "text-primary border-t-2 border-primary bg-primary/5" : "text-on-surface-variant"
                }`}
            >
              <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
              <span className="text-[9px] font-bold uppercase leading-tight text-center">{svc.label.split(" ").slice(0, 2).join(" ")}</span>
            </button>
          ))}
        </div>

        {/* ─── Main Content ─── */}
        <main className="flex-1 lg:ml-72 w-full pb-24 lg:pb-0">

          {/* ── Service Hero Card (Horizontal) ── */}
          <section className={`${activeService.color} transition-all duration-500`}>
            <div className="max-w-[1100px] mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

                {/* Left: Icon + title */}
                <div className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[52px] ${activeService.textColor}`}>{activeService.icon}</span>
                </div>

                {/* Center: Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className={`text-[12px] font-bold uppercase tracking-widest ${activeService.textColor} opacity-70`}>Selected Service</p>
                    <h1 className={`text-[32px] md:text-[40px] font-black ${activeService.textColor} leading-tight`}>{activeService.label}</h1>
                  </div>
                  <p className={`${activeService.textColor} opacity-80 max-w-xl text-sm`}>{activeService.description}</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {activeService.features.map((f) => (
                      <span key={f} className={`flex items-center gap-1.5 text-xs font-semibold bg-white/20 ${activeService.textColor} px-3 py-1.5 rounded-full`}>
                        <span className="material-symbols-outlined text-[14px]">{activeService.featureIcon}</span>{f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Price block */}
                <div className="flex-shrink-0 bg-white rounded-2xl px-8 py-6 shadow-xl text-center min-w-[160px]">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-1">Starting at</p>
                  <p className={`text-[42px] font-black ${activeService.accentColor} leading-none`}>{activeService.price}</p>
                  <p className="text-sm text-on-surface-variant font-semibold">{activeService.unit}</p>
                  <div className={`mt-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${activeService.badge}`}>
                    Delivery: {activeService.delivery}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Order Form ── */}
          <section className="max-w-[1100px] mx-auto px-6 py-10">
            {orderSubmitted && (
              <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-green-600 text-[36px]">check_circle</span>
                <div>
                  <p className="font-bold text-green-800">Order Placed Successfully!</p>
                  <p className="text-green-600 text-sm">We'll confirm your pickup details via SMS shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">

              {/* Step 1 — Select Clothing Types */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-full ${activeService.bgAccent} text-white flex items-center justify-center font-black text-sm`}>1</div>
                  <h2 className="text-xl font-bold text-on-surface">Select Clothing Types</h2>
                  {totalItems > 0 && (
                    <span className={`ml-auto text-sm font-bold ${activeService.accentColor} bg-primary/10 px-3 py-1 rounded-full`}>
                      {totalItems} items selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {activeService.clothingTypes.map((cloth) => {
                    const isSelected = !!selectedClothes[cloth];
                    const count = selectedClothes[cloth] || 0;
                    return (
                      <div
                        key={cloth}
                        className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${isSelected
                            ? `${activeService.borderColor} bg-primary/5 shadow-md`
                            : "border-outline-variant/30 bg-white hover:border-primary/30 hover:shadow-sm"
                          }`}
                        onClick={() => toggleCloth(cloth)}
                      >
                        <div className="p-4 flex flex-col items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? `${activeService.bgAccent}` : "bg-primary/5"
                            }`}>
                            <span className={`material-symbols-outlined text-[24px] ${isSelected ? "text-white" : activeService.accentColor}`}>
                              {CLOTHING_ICONS[cloth] || "checkroom"}
                            </span>
                          </div>
                          <span className={`text-xs font-bold text-center leading-tight ${isSelected ? activeService.accentColor : "text-on-surface-variant"}`}>
                            {cloth}
                          </span>
                        </div>

                        {/* Count controls */}
                        {isSelected && (
                          <div className={`flex items-center justify-between px-2 pb-3`} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => updateCount(cloth, -1)}
                              className="w-7 h-7 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface font-bold text-lg leading-none hover:bg-surface-container-low transition-colors"
                            >−</button>
                            <span className={`font-black text-base ${activeService.accentColor}`}>{count}</span>
                            <button
                              type="button"
                              onClick={() => updateCount(cloth, 1)}
                              className={`w-7 h-7 rounded-full ${activeService.bgAccent} text-white flex items-center justify-center font-bold text-lg leading-none hover:opacity-90 transition-colors`}
                            >+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 — Pickup Details */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-full ${activeService.bgAccent} text-white flex items-center justify-center font-black text-sm`}>2</div>
                  <h2 className="text-xl font-bold text-on-surface">Pickup Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Preferred Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">Pickup Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full address"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 — Special Instructions */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-full ${activeService.bgAccent} text-white flex items-center justify-center font-black text-sm`}>3</div>
                  <h2 className="text-xl font-bold text-on-surface">Special Instructions <span className="text-on-surface-variant font-normal text-base">(Optional)</span></h2>
                </div>
                <textarea
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g. Handle with care, avoid bleach on dark clothes, fold shirts in pairs..."
                  rows={4}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white resize-none"
                />
              </div>

              {/* Order Summary + Submit */}
              {totalItems > 0 && (
                <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-md p-6">
                  <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">receipt_long</span> Order Summary
                  </h3>
                  <div className="space-y-2 mb-6">
                    {Object.entries(selectedClothes).map(([cloth, count]) => (
                      <div key={cloth} className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{cloth}</span>
                        <span className={`font-bold ${activeService.accentColor}`}>× {count}</span>
                      </div>
                    ))}
                    <div className="border-t border-outline-variant/30 pt-3 mt-3 flex justify-between font-bold">
                      <span>Total Items</span>
                      <span className={activeService.accentColor}>{totalItems} pieces</span>
                    </div>
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>Service</span>
                      <span className="font-semibold">{activeService.label} — {activeService.price} {activeService.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>Estimated Delivery</span>
                      <span className="font-semibold">{activeService.delivery}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full ${activeService.bgAccent} text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3`}
                  >
                    <span className="material-symbols-outlined">local_shipping</span>
                    Place Order — {activeService.label}
                  </button>
                  <p className="text-center text-xs text-on-surface-variant mt-3">
                    By placing this order you agree to our <a href="#" className="text-primary underline">Terms of Service</a>
                  </p>
                </div>
              )}

              {totalItems === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-outline-variant/40 rounded-2xl text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-3 block opacity-40">shopping_bag</span>
                  <p className="font-semibold">Select clothing types above to place an order</p>
                </div>
              )}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
