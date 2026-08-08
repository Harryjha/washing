"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProfileDropdown from "../components/ProfileDropdown";
import AuthModal from "../components/AuthModal";

function HomeContent() {
  const [activeNav, setActiveNav] = useState("services");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  useEffect(() => {
    if (!loading && user?.role === "RIDER") router.replace("/rider");
  }, [user, loading, router]);

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      setAuthModal(auth);
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  // Tomorrow's date in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [heroDate, setHeroDate] = useState(tomorrowStr);
  const [heroAddress, setHeroAddress] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("quickPickupData", JSON.stringify({
        pickupDate: heroDate,
        pickupAddress: heroAddress,
      }));
    }
    router.push("/services");
  };

  const dashboardPath = user?.role === "ADMIN" ? "/admin" : user?.role === "RIDER" ? "/rider" : "/customer";
  const dashboardLabel = user?.role === "ADMIN" ? "Admin Dashboard" : user?.role === "RIDER" ? "Rider Dashboard" : "My Dashboard";

  if (loading) return <div className="p-8 text-center text-primary font-bold">Loading...</div>;

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md transition-all duration-300 shadow-sm h-20">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 h-full">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Washington Laundrettes" className="h-[64px] md:h-[80px] w-auto max-w-[320px] object-contain object-left" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/services"
                onClick={() => setActiveNav("services")}
                className={`font-label-md transition-all duration-200 pb-1 ${
                  activeNav === "services" || pathname === "/services"
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-primary/50"
                }`}
              >
                Services
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setActiveNav("how-it-works")}
                className={`font-label-md transition-all duration-200 pb-1 ${
                  activeNav === "how-it-works"
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-primary/50"
                }`}
              >
                How it Works
              </a>
              <a
                href="#pricing"
                onClick={() => setActiveNav("pricing")}
                className={`font-label-md transition-all duration-200 pb-1 ${
                  activeNav === "pricing"
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-primary/50"
                }`}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setActiveNav("testimonials")}
                className={`font-label-md transition-all duration-200 pb-1 ${
                  activeNav === "testimonials"
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-primary/50"
                }`}
              >
                Testimonials
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/services"
                  className="hidden md:block bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Schedule Pickup
                </Link>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="hidden md:block font-label-md text-on-surface-variant hover:text-primary px-4 py-2 transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModal("register");
                    setMobileMenuOpen(false);
                  }}
                  className="hidden md:block bg-primary text-white font-label-md px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
            <button
              className="md:hidden text-on-surface p-2 flex items-center justify-center rounded-lg hover:bg-surface-container transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Slide-down */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-surface/95 backdrop-blur-md shadow-xl py-6 flex flex-col gap-1 border-t border-outline-variant/20 z-40 px-4">
            <Link href="/services" className="font-label-md font-semibold text-on-surface px-4 py-3 rounded-xl hover:bg-surface-container flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <span className="material-symbols-outlined text-primary text-xl">dry_cleaning</span>Services
            </Link>
            <a href="#how-it-works" className="font-label-md text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <span className="material-symbols-outlined text-xl text-outline">info</span>How it Works
            </a>
            <a href="#pricing" className="font-label-md text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <span className="material-symbols-outlined text-xl text-outline">payments</span>Pricing
            </a>
            <a href="#testimonials" className="font-label-md text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <span className="material-symbols-outlined text-xl text-outline">star</span>Testimonials
            </a>
            <div className="h-px bg-outline-variant/30 my-3"></div>
            {user ? (
              <div className="px-4"><ProfileDropdown /></div>
            ) : (
              <div className="flex flex-col gap-3 px-2">
                <button
                  onClick={() => {
                    setAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="font-label-md font-semibold text-primary border border-primary/30 px-4 py-3.5 rounded-xl hover:bg-primary/5 transition-all text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModal("register");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-primary text-white font-label-md font-bold px-4 py-3.5 rounded-xl shadow-sm text-center hover:bg-primary/90 transition-all"
                >
                  Get Started — Free Pickup
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Full-screen background image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Laundry background"
            className="w-full h-full object-cover object-center"
            src="/colour.png"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-10 w-full flex items-center" style={{ minHeight: "calc(100vh - 80px)" }}>
          <div className="w-full max-w-xl space-y-5">
            <h1 className="text-white text-[38px] md:text-[52px] leading-[1.1] font-extrabold uppercase tracking-tight">
              WE&apos;LL HANDLE THE LAUNDRY.<br/>
              <span className="text-primary-container">YOU ENJOY YOUR DAY</span>
            </h1>

            <p className="text-lg md:text-xl font-bold uppercase flex flex-wrap gap-x-3">
              <span className="text-[#27c0fd]">WASH,</span>
              <span className="text-[#f472b6]">DRY,</span>
              <span className="text-[#fb923c]">FOLD,</span>
              <span className="text-[#34d399]">STEAMPRESS.</span>
            </p>

            {/* Value Propositions */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">local_shipping</span>
                <span className="text-xs font-semibold text-white/80">Free Pickup & Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">schedule</span>
                <span className="text-xs font-semibold text-white/80">24h Turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">eco</span>
                <span className="text-xs font-semibold text-white/80">Eco-Friendly</span>
              </div>
            </div>

            {/* Booking Form Card */}
            <div className="glass-card rounded-2xl p-6 shadow-2xl">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-on-surface">Schedule a Pickup</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Book your laundry service in seconds.</p>
              </div>
              <form onSubmit={handleHeroSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5" htmlFor="pickup-date">Pickup Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline text-base">calendar_today</span>
                    </div>
                    <input
                      className="pl-10 block w-full border border-outline-variant rounded-xl focus:ring-primary focus:border-primary text-sm py-2.5 px-3 shadow-sm bg-surface-container-lowest outline-none"
                      id="pickup-date"
                      type="date"
                      value={heroDate}
                      onChange={(e) => setHeroDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5" htmlFor="pickup-address">Pickup Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline text-base">location_on</span>
                    </div>
                    <input
                      className="pl-10 block w-full border border-outline-variant rounded-xl focus:ring-primary focus:border-primary text-sm py-2.5 px-3 shadow-sm placeholder:text-outline bg-surface-container-lowest outline-none"
                      id="pickup-address"
                      placeholder="Street & area"
                      type="text"
                      value={heroAddress}
                      onChange={(e) => setHeroAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button
                    className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-bold text-on-primary bg-primary-container hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
                    type="submit"
                  >
                    Book My Pickup
                    <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Services & Pricing ─── */}
      <section
        id="pricing"
        className="py-[80px] bg-surface-container-low overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="font-label-md text-primary tracking-widest uppercase font-bold">
              Our Services
            </span>
            <h2 className="font-display-lg text-[32px] md:text-[44px] leading-tight font-extrabold text-primary">
              Transparent Pricing for Every Need
            </h2>
          </div>

          <div
            id="services"
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none no-scrollbar"
          >
            {/* ── Card 1: WASH AND FOLD (MOST POPULAR) ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border-2 border-primary snap-center min-w-[300px] md:min-w-0">
              {/* Most Popular ribbon */}
              <div className="popular-badge" style={{ background: '#006689' }}>MOST POPULAR</div>
              <div className="pricing-card-header bg-primary text-center text-white">
                <h3 className="text-2xl tracking-wide uppercase font-extrabold">WASH &amp; FOLD</h3>
                <p className="text-xs text-white/70 mt-1 tracking-widest uppercase">Includes: Wash + Dry + Fold</p>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary/10">
                  <span className="text-primary font-black text-4xl">₹79</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
                </div>
                <div className="bg-primary/10 rounded-full px-6 py-1.5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Minimum Billing: Rs 349
                </div>
                <div className="bg-surface-variant/50 rounded-full px-6 py-1.5 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                  Delivery — Within 24 Hours
                </div>
                <ul className="text-on-surface-variant text-base space-y-3 w-full">
                  {[["local_laundry_service", "Premium Detergents"], ["sanitizer", "Hygienic Processing"], ["palette", "Color Separation"], ["dry_cleaning", "Fabric Care"], ["verified", "Quality Check"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=wash-and-fold" className="mt-auto w-full bg-primary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md text-center block">Book Now</Link>
              </div>
            </div>

            {/* ── Card 2: WASH AND IRONING (MOST POPULAR) ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border-2 border-secondary snap-center min-w-[300px] md:min-w-0">
              <div className="popular-badge" style={{ background: '#325f9b' }}>MOST POPULAR</div>
              <div className="pricing-card-header bg-secondary text-center text-white">
                <h3 className="text-2xl tracking-wide uppercase font-extrabold">WASH &amp; IRON</h3>
                <p className="text-xs text-white/70 mt-1 tracking-widest uppercase">Includes: Wash + Dry + Ironing</p>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-secondary/10">
                  <span className="text-secondary font-black text-4xl">₹120</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
                </div>
                <div className="bg-secondary-fixed rounded-full px-6 py-1.5 text-secondary font-bold uppercase tracking-widest text-xs">
                  Minimum Billing: Rs 349
                </div>
                <div className="bg-surface-variant/50 rounded-full px-6 py-1.5 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                  Delivery — 2 Days
                </div>
                <ul className="text-on-surface-variant text-base space-y-3 w-full">
                  {[["iron", "Steam Ironing"], ["clean_hands", "Stain Removal"], ["local_laundry_service", "Fabric Softener"], ["verified", "Quality Check"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=wash-and-ironing" className="mt-auto w-full bg-secondary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md text-center block">Book Now</Link>
              </div>
            </div>

            {/* ── Card 3: DRY CLEANING (MOST POPULAR) ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border-2 border-tertiary snap-center min-w-[300px] md:min-w-0">
              <div className="popular-badge" style={{ background: '#af3100' }}>MOST POPULAR</div>
              <div className="pricing-card-header bg-tertiary-container text-center text-on-tertiary-container">
                <h3 className="text-2xl tracking-wide uppercase font-extrabold">DRY CLEANING</h3>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-tertiary/20">
                  <span className="text-tertiary font-black text-4xl">₹99</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ ITEM</span>
                </div>
                <div className="bg-primary/10 rounded-full px-6 py-1.5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Minimum Billing: Rs 349
                </div>
                <div className="bg-tertiary-fixed rounded-full px-6 py-1.5 text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-widest">
                  Delivery — 4 Days
                </div>
                <ul className="text-on-surface-variant text-base space-y-3 w-full">
                  {[["eco", "Eco-friendly Solvents"], ["dry_cleaning", "Designer Garment Care"], ["auto_awesome", "Premium Finishing"], ["spa", "Fabric Analysis"], ["verified", "Individual Packaging"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=dry-cleaning" className="mt-auto w-full bg-tertiary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md text-center block">Book Now</Link>
              </div>
            </div>

            {/* ── Card 4: PREMIUM LAUNDRY ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30 snap-center min-w-[300px] md:min-w-0">
              <div className="pricing-card-header bg-primary-container text-center text-on-primary-container">
                <h3 className="text-2xl tracking-wide uppercase font-black">Premium Laundry</h3>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary-container/20">
                  <span className="text-primary font-black text-4xl">₹199</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
                </div>
                <div className="bg-primary/10 rounded-full px-6 py-1.5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Minimum Billing: Rs 349
                </div>
                <div className="bg-primary text-white rounded-full px-6 py-1.5 text-xs font-bold uppercase tracking-widest animate-pulse">
                  Delivery — Same Day
                </div>
                <ul className="text-base space-y-3 font-semibold w-full">
                  {[["verified", "WASH AND IRONING"], ["inventory", "INDIVIDUAL PACKING"], ["bolt", "Priority Pickup"], ["local_shipping", "Same-Day Delivery"], ["star", "Premium Care"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=premium-laundry" className="mt-auto w-full bg-primary-container text-on-primary-container font-black px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-lg text-center block">Book Now</Link>
              </div>
            </div>

            {/* ── Card 5: HOUSEHOLD LAUNDRY ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30 snap-center min-w-[300px] md:min-w-0">
              <div className="pricing-card-header bg-primary text-center text-white">
                <h3 className="text-2xl tracking-wide uppercase font-extrabold">HOUSEHOLD LAUNDRY</h3>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary/20">
                  <span className="text-primary font-black text-4xl">₹169</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ ITEM</span>
                </div>
                <div className="bg-primary/10 rounded-full px-6 py-1.5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">Minimum Billing: Rs 349</div>
                <div className="bg-primary-fixed-dim rounded-full px-6 py-1.5 text-on-primary-fixed-variant text-xs font-bold uppercase tracking-widest">Standard Delivery</div>
                <ul className="text-on-surface-variant text-base space-y-3 w-full">
                  {[["bed", "Duvets & Blankets"], ["window", "Bedsheets & Pillows"], ["sanitizer", "Deep Sanitization"], ["local_laundry_service", "Anti-Allergen Wash"], ["verified", "Quality Check"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=household-laundry" className="mt-auto w-full bg-primary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md text-center block">Book Now</Link>
              </div>
            </div>

            {/* ── Card 6: EXPRESS SERVICE ── */}
            <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30 snap-center min-w-[300px] md:min-w-0">
              <div className="pricing-card-header text-center text-white" style={{ backgroundColor: "#124782" }}>
                <h3 className="text-2xl tracking-wide uppercase font-extrabold">Express Service</h3>
              </div>
              <div className="p-8 flex flex-col flex-grow items-center text-center space-y-5">
                <div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border" style={{ borderColor: "rgba(18,71,130,0.2)" }}>
                  <span className="text-primary font-black text-4xl">₹249</span>
                  <span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
                </div>
                <div className="bg-primary/10 rounded-full px-6 py-1.5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">Minimum Billing: Rs 599</div>
                <div className="bg-secondary-container rounded-full px-6 py-1.5 text-on-secondary-container text-xs font-bold uppercase tracking-widest">Delivery — 6 Hours</div>
                <ul className="text-on-surface-variant text-base space-y-3 w-full">
                  {[["bolt", "Super Fast Processing"], ["local_shipping", "Express Delivery"], ["verified_user", "Guaranteed Quality"], ["priority_high", "Priority Handling"], ["schedule", "6-Hour Turnaround"]].map(([icon, label]) => (
                    <li key={label} className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>{label}
                    </li>
                  ))}
                </ul>
                <Link href="/services?service=express-service" className="mt-auto w-full text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md text-center block" style={{ backgroundColor: "#124782" }}>Book Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Items We Process ─── */}
      <section className="py-[80px] bg-surface overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-lg text-[32px] md:text-[44px] font-extrabold text-primary uppercase tracking-tight">
              Items We Process Include
            </h2>
          </div>

          <div className="relative group">
            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
              {[
                { label: "SHOES", icon: "footprint" },
                { label: "COATS", icon: "checkroom" },
                { label: "JACKETS", icon: "dry_cleaning" },
                { label: "CURTAINS", icon: "blinds" },
                { label: "BLANKETS", icon: "bed" },
                { label: "SHIRTS", icon: "iron" },
                { label: "TROUSERS", icon: "style" },
              ].map(({ label, icon }) => (
                <div key={label} className="flex-none w-64 snap-center">
                  <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
                    <div className="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full">
                      <span className="material-symbols-outlined text-[40px] text-primary">
                        {icon}
                      </span>
                    </div>
                    <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section
        id="how-it-works"
        className="py-[80px] bg-surface-container-low overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-6">
            <h2 className="font-display-lg text-[32px] md:text-[48px] font-extrabold text-primary leading-tight">
              <span className="text-primary">
                Professional laundry care, delivered to your doorstep&nbsp;Makes
              </span>{" "}
              <span className="text-tertiary relative inline-block">
                Life Easier!
                <span className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/30 rounded-full" />
              </span>
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-3xl mx-auto">
              At Washington, we offer reliable laundry and{" "}
              <a
                className="text-primary font-semibold hover:underline"
                href="#services"
              >
                dry cleaning services
              </a>{" "}
              designed to make your life easier. From careful garment handling to
              on-time delivery at your doorstep, we ensure your clothes are treated
              with the utmost care and professionalism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: "calendar_month",
                title: "Effortless Scheduling",
                desc: "Book Your Laundry Pickup in Just a Few Clicks.",
              },
              {
                icon: "front_loader",
                title: "Doorstep Pickup",
                desc: "Seamless Pickup at Your Convenience.",
              },
              {
                icon: "sanitizer",
                title: "Professional Cleaning",
                desc: "Eco-Friendly Cleaning for Every Fabric.",
              },
              {
                icon: "local_shipping",
                title: "On-Time Delivery",
                desc: "Fresh, Clean Clothes Delivered Right to Your Doorstep.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-24 h-24 mb-6 flex items-center justify-center bg-primary-container/10 rounded-full group-hover:bg-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-[48px] text-primary group-hover:text-white">
                    {icon}
                  </span>
                </div>
                <h3 className="font-title-md text-primary mb-3 uppercase tracking-wider">
                  {title}
                </h3>
                <p className="font-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/register"
              className="text-white font-label-md px-12 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest"
              style={{ backgroundColor: "#003355" }}
            >
              Schedule Pickup
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="py-[80px] bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-lg text-[32px] md:text-[44px] font-extrabold text-primary uppercase tracking-tight">
              Why Choose Us
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              We&apos;ve redefined the laundry experience with a focus on quality,
              sustainability, and your convenience.
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 no-scrollbar items-stretch">
            {[
              {
                icon: "eco",
                title: "Eco Friendly",
                desc: "We use non-toxic, skin-friendly agents and biodegradable solvents that protect both your garments and the environment.",
              },
              {
                icon: "payments",
                title: "Price Promise",
                desc: "Transparent pricing with no hidden fees. Enjoy special rewards and loyalty discounts based on your usage patterns.",
              },
              {
                icon: "support_agent",
                title: "Responsive",
                desc: "Your feedback drives our innovation. We listen, adapt, and act quickly to ensure your experience is always improving.",
              },
              {
                icon: "schedule",
                title: "Convenient",
                desc: "On-demand pickup and delivery with express 6-hour turnarounds. We work around your schedule, not the other way around.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col sm:flex-row gap-6 items-start group min-w-[300px] snap-center md:min-w-0"
              >
                <div className="bg-primary-container/10 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <span className="material-symbols-outlined text-[32px]">{icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-title-md text-primary uppercase tracking-wider">
                    {title}
                  </h3>
                  <p className="font-body-md text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-[80px] bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="font-label-md text-primary tracking-widest uppercase">
                Client Feedback
              </span>
              <h2 className="font-display-lg text-[32px] md:text-[40px] font-extrabold text-primary">
                Trusted by Thousands
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 no-scrollbar">
            {[
              {
                initials: "SC",
                name: "Sarah Chen",
                role: "Marketing Executive",
                text: '"Washington has literally given me back my Sundays. The quality of the folding is better than I could ever do myself. It\'s like getting a package of brand new clothes every week."',
              },
              {
                initials: "JM",
                name: "James Miller",
                role: "Freelance Designer",
                text: '"As a busy professional, I appreciate the reliability. They always arrive within their window, and my dry cleaning comes back perfect every single time."',
              },
              {
                initials: "EL",
                name: "Elena Lopez",
                role: "Architect",
                text: '"Their eco-friendly process was the main selling point for me. No chemical smell on my clothes, and the convenience is unmatched. Highly recommend!"',
              },
            ].map(({ initials, name, role, text }) => (
              <div
                key={name}
                className="p-8 bg-surface-container-low rounded-xl border border-transparent hover:border-primary/10 transition-all min-w-[320px] snap-center md:min-w-0"
              >
                <div className="flex gap-1 mb-6 text-primary-container">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-lg text-on-surface mb-8 italic">{text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="font-title-md text-sm text-primary">{name}</p>
                    <p className="font-body-md text-xs text-on-surface-variant">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="max-w-[1200px] mx-auto px-6 mb-[80px]">
        <div className="relative bg-primary rounded-xl overflow-hidden p-12 md:p-20 text-center space-y-8 zero-gravity-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
          <h2 className="relative z-10 font-display-lg text-[32px] md:text-[48px] font-extrabold text-white">
            Ready to outsmart your chores?
          </h2>
          <p className="relative z-10 font-body-lg text-white/80 max-w-xl mx-auto">
            Join over 10,000 satisfied customers who have reclaimed their free time
            with Washington Laundry.
          </p>
          <div className="relative z-10 pt-4">
            <Link
              href="/register"
              className="bg-primary-container text-on-primary-container font-label-md px-10 py-5 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl inline-block"
            >
              Get Started Now
            </Link>
          </div>
          <p className="relative z-10 font-body-md text-white/60">
            First pickup is 20% off with code: FRESHSTART
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full py-[80px] bg-surface-container-low border-t border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6">
          {/* Brand */}
          <div className="space-y-6">
            <Link
              href="/"
              className="text-2xl font-extrabold text-primary tracking-tight block"
            >
              WASHINGTON
            </Link>
            <p className="font-body-md text-on-surface-variant">
              The gold standard in laundry and dry cleaning logistics. Clean,
              professional, and always on time.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">face_nod</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="font-label-md text-sm text-primary uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-4">
              {["About Us", "Sustainability", "Careers"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="font-label-md text-sm text-primary uppercase tracking-widest">
              Services
            </h4>
            <ul className="space-y-4">
              {["Wash & Fold", "Dry Cleaning", "Launder & Press", "Hang Dry"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-label-md text-sm text-primary uppercase tracking-widest">
              Support
            </h4>
            <ul className="space-y-4">
              {["Support", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="max-w-[1200px] mx-auto px-6 pt-16 mt-16 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-on-surface-variant text-sm">
            ©️ 2024 Washington Laundry. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-[18px]">public</span>
              Global Standards
            </span>
            <span className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Secure Checkout
            </span>
          </div>
        </div>
      </footer>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-primary font-bold">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
