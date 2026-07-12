const fs = require('fs');

const html = `<!DOCTYPE html><html class="scroll-smooth" lang="en" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>FreshFold | Premium Laundry &amp; Dry Cleaning Delivered</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind Configuration -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                "outline": "#6e7980",
                "background": "#f7f9fb",
                "secondary-container": "#93bdff",
                "surface-container": "#eceef0",
                "on-tertiary-container": "#711c00",
                "surface-container-high": "#e6e8ea",
                "surface-container-highest": "#e0e3e5",
                "inverse-primary": "#77d1ff",
                "on-tertiary": "#ffffff",
                "on-surface-variant": "#3e484f",
                "on-tertiary-fixed-variant": "#862300",
                "surface-container-low": "#f2f4f6",
                "secondary-fixed": "#d5e3ff",
                "primary-container": "#2bb1e7",
                "on-error-container": "#93000a",
                "primary": "#006689",
                "on-primary": "#ffffff",
                "on-secondary-container": "#194b86",
                "surface": "#f7f9fb",
                "on-background": "#191c1e",
                "on-error": "#ffffff",
                "on-primary-container": "#004057",
                "secondary": "#325f9b",
                "on-primary-fixed-variant": "#004d68",
                "tertiary": "#af3100",
                "primary-fixed-dim": "#77d1ff",
                "on-secondary-fixed-variant": "#124782",
                "tertiary-container": "#ff815a",
                "surface-bright": "#f7f9fb",
                "surface-container-lowest": "#ffffff",
                "on-secondary-fixed": "#001c3b",
                "inverse-on-surface": "#eff1f3",
                "surface-variant": "#e0e3e5",
                "surface-dim": "#d8dadc",
                "tertiary-fixed": "#ffdbd1",
                "outline-variant": "#bdc8d0",
                "on-primary-fixed": "#001e2c",
                "on-tertiary-fixed": "#3a0a00",
                "inverse-surface": "#2d3133",
                "error": "#ba1a1a",
                "on-secondary": "#ffffff",
                "primary-fixed": "#c2e8ff",
                "tertiary-fixed-dim": "#ffb59f",
                "error-container": "#ffdad6",
                "surface-tint": "#006689",
                "on-surface": "#191c1e",
                "secondary-fixed-dim": "#a7c8ff",
                "accent-gold": "#ff815a"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "base": "8px",
                "lg": "48px",
                "margin-mobile": "16px",
                "gutter": "24px",
                "md": "24px",
                "margin-desktop": "64px",
                "xl": "80px",
                "xs": "4px",
                "sm": "12px",
                "section-padding-desktop": "80px"
            },
            "fontFamily": {
                "display-lg": ["Hanken Grotesk"],
                "label-sm": ["Hanken Grotesk"],
                "body-lg": ["Hanken Grotesk"],
                "title-md": ["Hanken Grotesk"],
                "headline-lg": ["Hanken Grotesk"],
                "label-md": ["Hanken Grotesk"],
                "body-md": ["Hanken Grotesk"],
                "headline-lg-mobile": ["Hanken Grotesk"]
            },
            "fontSize": {
                "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
                "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                "title-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
                "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .zero-gravity-shadow {
            box-shadow: 0 10px 30px -10px rgba(0, 102, 137, 0.1);
            transition: all 0.3s ease-in-out;
        }
        .zero-gravity-shadow:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 102, 137, 0.2);
        }
        .pricing-card-header {
            border-radius: 0.75rem 0.75rem 0 0;
            padding: 2.5rem 1rem 1.75rem;
        }
        .popular-badge {
            position: absolute;
            top: 20px;
            right: -35px;
            background: #ff815a;
            color: #ffffff;
            padding: 8px 40px;
            transform: rotate(45deg);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 10;
        }
        .premium-glow:hover {
            box-shadow: 0 0 20px 2px rgba(43, 177, 231, 0.3);
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- Top Navigation Bar -->
<nav class="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md transition-all duration-300 h-20 shadow-sm">
<div class="max-w-[1200px] mx-auto flex justify-between items-center px-6 h-full">
<div class="flex items-center gap-12">
<a class="text-headline-lg font-headline-lg font-extrabold text-primary tracking-tight" href="/">WASHINGTON</a>
<div class="hidden md:flex items-center gap-8">
<a class="font-label-md text-primary font-bold border-b-2 border-primary pb-1 transition-colors duration-200" href="#">Services</a>
<a class="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">How it Works</a>
<a class="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Pricing</a>
<a class="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Testimonials</a>
</div>
</div>
<div class="flex items-center gap-4">
<button onClick={logout} className="hidden md:block font-label-md text-on-surface-variant hover:text-primary px-4 py-2 transition-all">Logout</button>
<button onClick={() => setIsModalOpen(true)} className="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">Schedule Pickup</button>
</div>
</div>
</nav>
<!-- Hero Section -->
<header class="relative overflow-hidden bg-surface">
<div class="relative min-h-[600px] flex items-center">
<div class="absolute inset-0 z-0">
<img alt="Laundry background" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMfNRsCkjfh6fl3ZFqCnfG_jV5l5sLnGiCCjPFv9z1XA6Lw2R8LKmViAfM4s-9kpyuT6mcVnUnTP4705wUXnwX94umyv21GSbiN71wgT-axAicfp0UeuvIoJQryL8dGS-JCdtc00BFVCYVBuDPujKbCGOT9ZrmYIzwzVQddGiTpmlgVNDhEls_ZeNyzLc4K45mLiyKcRKNEV5eN23PJ-1GUpg9uq87WinX8lsRo36efzIBbVoNJCzLmPu1Q9B6kpYsOqTjtUJYN-w" />
<div class="absolute inset-0 bg-black/30"></div>
</div>
<div class="relative z-10 max-w-[1200px] mx-auto px-6 py-20 w-full">
<div class="max-w-2xl space-y-8">
<h1 class="font-display-lg text-white text-[48px] md:text-[64px] leading-[1.1] font-extrabold uppercase tracking-tight"><div className=""><span className="" style={{letterSpacing: "-0.025em"}}>WE'LL HANDLE THE LAUNDRY.</span></div>
<span className="text-primary-container">YOU ENJOY YOUR DAY</span></h1>
<p className="font-body-lg text-xl md:text-2xl max-w-lg font-bold uppercase flex flex-wrap gap-x-2"><span style={{color: "rgb(76, 175, 80)"}} className="">WASH,</span> <span style={{color: "rgb(156, 39, 176)"}} className="">DRY,</span> <span style={{color: "rgb(233, 30, 99)"}} className="">FOLD,</span> <span style={{color: "rgb(255, 87, 34)"}} className="">STEAMPRESS.</span></p>
<div className="bg-white rounded-full p-2 flex items-center shadow-xl max-w-md">
<div className="flex-1 px-6 border-r border-outline-variant">
<div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pickup</div>
<div className="text-on-surface font-semibold">Tomorrow</div>
</div>
<div className="flex-1 px-6">
<div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Where</div>
<div className="text-on-surface-variant">Add address</div>
</div>
<button onClick={() => setIsModalOpen(true)} className="bg-primary-container text-on-primary-container w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-all">
<span className="material-symbols-outlined">arrow_forward</span>
</button>
</div>

</div>
</div>
</div>
<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-[1000px] px-6">
  
</div></header>

<section className="py-section-padding-desktop bg-surface overflow-hidden">
  <div className="max-w-[1200px] mx-auto px-6">
    <div className="text-center mb-16 space-y-4 pt-8">
      <h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary uppercase tracking-tight">Your Orders</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order: any) => (
        <div key={order.id} className="bg-white rounded-2xl p-6 zero-gravity-shadow border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-md text-primary">Order #{order.id}</h3>
            <span className={\`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest \${
              order.status === 'DELIVERED' ? 'bg-primary/10 text-primary' : 
              order.status === 'PENDING' ? 'bg-tertiary-container/20 text-tertiary' : 
              'bg-secondary-fixed text-secondary'
            }\`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-on-surface-variant mb-4">{order.itemsDescription}</p>
          <div className="text-sm">
            <strong className="text-on-surface">Pickup:</strong> {order.pickupAddress}
          </div>
          {order.rider && (
            <div className="mt-4 p-3 bg-surface-container-low rounded-xl text-sm border border-outline-variant/20">
              <strong className="text-primary">Rider:</strong> {order.rider.name} ({order.rider.phone})
            </div>
          )}
        </div>
      ))}
      {orders.length === 0 && (
        <div className="col-span-full text-center py-12 text-on-surface-variant font-medium">
          You have no orders yet. Schedule a pickup to get started!
        </div>
      )}
    </div>
  </div>
</section>

<!-- Services and Pricing Section -->
<section className="py-section-padding-desktop bg-surface-container-low overflow-hidden pt-16">
<div className="max-w-[1200px] mx-auto px-6">
<div className="text-center mb-16 space-y-4">
<span className="font-label-md text-primary tracking-widest uppercase font-bold">Our Services</span>
<h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary">Transparent Pricing for Every Need</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
<!-- Card 1: WASH+DRY+FOLD -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30">
<div className="pricing-card-header bg-primary text-center text-white">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-extrabold">WASH+DRY+FOLD</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary/10">
<span className="text-primary font-black text-4xl">₹80</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
</div>
<div className="bg-surface-variant/50 rounded-full px-6 py-1.5 text-on-surface-variant text-xs font-bold uppercase tracking-widest border border-outline-variant/20">
                            Delivery - 1 Day
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-semibold text-lg">Professional laundry service cleaned to perfection.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none">
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Expert Sorting</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Premium Detergents</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Neat Folding</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-on-primary-container hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md">Book Now</button>
</div>
</div>
<!-- Card 2: WASH+DRY+IRONING -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30">
<div className="pricing-card-header bg-secondary text-center text-white">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-extrabold">WASH+DRY+IRONING</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-secondary/10">
<span className="text-secondary font-black text-4xl">₹120</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
</div>
<div className="bg-secondary-fixed rounded-full px-6 py-1.5 text-secondary font-bold uppercase tracking-widest">
                            Delivery - 2 Days
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-semibold text-lg">Expertly washed and pressed for a crisp finish.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none">
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">check_circle</span> Steam Ironing</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">check_circle</span> Hanger Service</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">check_circle</span> Stain Removal</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-secondary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md">Book Now</button>
</div>
</div>
<!-- Card 3: Premium Laundry -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border-2 border-primary-container premium-glow">
<div className="popular-badge">MOST POPULAR</div>
<div className="pricing-card-header bg-primary-container text-center text-on-primary-container">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-black">Premium Laundry</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary-container/20">
<span className="text-primary font-black text-4xl">₹199</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
</div>
<div className="bg-primary text-white rounded-full px-6 py-1.5 text-xs font-bold uppercase tracking-widest animate-pulse">
                            Delivery - Same Day
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-bold text-lg">Our highest level of care with individual protection.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none font-semibold">
<li className="flex items-center justify-center gap-2 text-primary"><span className="material-symbols-outlined text-lg">verified</span> WASH+DRY+IRONING</li>
<li className="flex items-center justify-center gap-2 text-primary"><span className="material-symbols-outlined text-lg">verified</span> INDIVIDUAL PACKING</li>
<li className="flex items-center justify-center gap-2 text-primary"><span className="material-symbols-outlined text-lg">verified</span> Priority Pickup</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-primary-container text-on-primary-container font-black px-8 py-4 rounded-xl hover:bg-primary-container/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-lg">Book Now</button>
</div>
</div>
<!-- Card 4: DRY Cleaning -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30">
<div className="pricing-card-header bg-tertiary-container text-center text-on-tertiary-container">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-extrabold">DRY Cleaning</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-tertiary-container/20">
<span className="text-tertiary font-black text-4xl">₹99</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ ITEM</span>
</div>
<div className="bg-tertiary-fixed rounded-full px-6 py-1.5 text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-widest">
                            Delivery - 4 Days
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-semibold text-lg">Specialized care for delicate fabrics.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none">
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-tertiary text-lg">eco</span> Eco-friendly Solvents</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-tertiary text-lg">dry_cleaning</span> Designer Garment Care</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-tertiary text-lg">auto_awesome</span> Premium Finishing</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-tertiary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md">Book Now</button>
</div>
</div>
<!-- Card 5: HOUSEHOLD LAUNDRY -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30">
<div className="pricing-card-header bg-primary text-center text-white">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-extrabold">HOUSEHOLD LAUNDRY</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-primary/20">
<span className="text-primary font-black text-4xl">₹169</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ ITEM</span>
</div>
<div className="bg-primary-fixed-dim rounded-full px-6 py-1.5 text-on-primary-fixed-variant text-xs font-bold uppercase tracking-widest">
                            Standard Delivery
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-semibold text-lg">Bulk care for your home essentials.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none">
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">bed</span> Duvets &amp; Blankets</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">window</span> Bedsheets &amp; Pillows</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-primary text-lg">sanitizer</span> Deep Sanitization</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-primary text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md">Book Now</button>
</div>
</div>
<!-- Card 6: Express Service -->
<div className="relative bg-white rounded-2xl overflow-hidden flex flex-col zero-gravity-shadow border border-outline-variant/30">
<div className="pricing-card-header bg-[#124782] text-center text-white">
<h3 className="font-headline-lg text-2xl tracking-wide uppercase font-extrabold">Express Service</h3>
</div>
<div className="p-8 flex flex-col flex-grow items-center text-center space-y-8">
<div className="relative -mt-14 bg-white rounded-full px-8 py-3 shadow-xl border border-[#124782]/20">
<span className="text-primary font-black text-4xl">₹249</span>
<span className="text-on-surface-variant text-sm font-bold uppercase ml-1">/ KG</span>
</div>
<div className="bg-secondary-container rounded-full px-6 py-1.5 text-on-secondary-container text-xs font-bold uppercase tracking-widest">
                            Delivery - 6 Hours
                        </div>
<div className="space-y-4 w-full">
<p className="text-on-surface font-semibold text-lg">Rapid turnaround when time is of the essence.</p>
<ul className="text-on-surface-variant text-md space-y-3 list-none">
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">bolt</span> Super Fast Processing</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">local_shipping</span> Express Delivery</li>
<li className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">verified_user</span> Guaranteed Quality</li>
</ul>
</div>
<button onClick={() => setIsModalOpen(true)} className="mt-auto w-full bg-[#124782] text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest shadow-md">Book Now</button>
</div>
</div>
</div>
</div>
</section><section className="py-section-padding-desktop bg-surface overflow-hidden">
  <div className="max-w-[1200px] mx-auto px-6">
    <div className="text-center mb-16 space-y-4">
      <h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary uppercase tracking-tight">Items We Process Include</h2>
    </div>
    <div className="relative group">
      <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
        <!-- TOYS -->
        <div className="flex-none w-64 snap-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="TOYS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 3% 45% 96%)", transform: "scale(25)"}} />
            </div>
            <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">TOYS</span>
          </div>
        </div>
        <!-- COATS -->
        <div className="flex-none w-64 snap-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="COATS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 21% 45% 78%)", transform: "scale(25)"}} />
            </div>
            <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">COATS</span>
          </div>
        </div>
        <!-- JACKETS -->
        <div className="flex-none w-64 snap-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="JACKETS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 39% 45% 60%)", transform: "scale(25)"}} />
            </div>
            <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">JACKETS</span>
          </div>
        </div>
        <!-- CURTAINS -->
        <div className="flex-none w-64 snap-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="CURTAINS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 58% 45% 41%)", transform: "scale(25)"}} />
            </div>
            <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">CURTAINS</span>
          </div>
        </div>
        <!-- BLANKETS -->
        <div className="flex-none w-64 snap-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
            <div className="w-32 h-32 flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="BLANKETS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 77% 45% 22%)", transform: "scale(25)"}} />
            </div>
            <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">BLANKETS</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-8">
        <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40"></div>
        <div className="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
      </div>
    </div>
  </div>
  <style>
    {\`.no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\`}
  </style>
</section><section className="py-section-padding-desktop bg-surface-container-low overflow-hidden pt-16">
<div className="max-w-[1200px] mx-auto px-6">
<div className="text-center mb-16 space-y-6">
<h2 className="font-display-lg text-headline-lg md:text-[48px] text-primary leading-tight"><span className="text-primary">Professional laundry care, delivered to your doorstep&nbsp;Makes</span> <span className="text-tertiary relative inline-block">Life Easier!<span className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/30 rounded-full"></span></span>
</h2>
<p className="font-body-lg text-on-surface-variant max-w-3xl mx-auto">
        At Laundrywala, we offer reliable laundry and <a className="text-primary font-semibold hover:underline" href="#">dry cleaning services</a> designed to make your life easier. From careful garment handling to on-time delivery at your doorstep, we ensure your clothes are treated with the utmost care and professionalism.
      </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
<!-- Step 1 -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
<div className="w-24 h-24 mb-6 flex items-center justify-center bg-primary-container/10 rounded-full group-hover:bg-primary transition-colors duration-300">
<span className="material-symbols-outlined text-[48px] text-primary group-hover:text-white">calendar_month</span>
</div>
<h3 className="font-title-md text-primary mb-3 uppercase tracking-wider">Effortless Scheduling</h3>
<p className="font-body-md text-on-surface-variant">Book Your Laundry Pickup in Just a Few Clicks.</p>
</div>
<!-- Step 2 -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
<div className="w-24 h-24 mb-6 flex items-center justify-center bg-primary-container/10 rounded-full group-hover:bg-primary transition-colors duration-300">
<span className="material-symbols-outlined text-[48px] text-primary group-hover:text-white">front_loader</span>
</div>
<h3 className="font-title-md text-primary mb-3 uppercase tracking-wider">Doorstep Pickup</h3>
<p className="font-body-md text-on-surface-variant">Seamless Pickup at Your Convenience.</p>
</div>
<!-- Step 3 -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
<div className="w-24 h-24 mb-6 flex items-center justify-center bg-primary-container/10 rounded-full group-hover:bg-primary transition-colors duration-300">
<span className="material-symbols-outlined text-[48px] text-primary group-hover:text-white">sanitizer</span>
</div>
<h3 className="font-title-md text-primary mb-3 uppercase tracking-wider">Professional Cleaning</h3>
<p className="font-body-md text-on-surface-variant">Eco-Friendly Cleaning for Every Fabric.</p>
</div>
<!-- Step 4 -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
<div className="w-24 h-24 mb-6 flex items-center justify-center bg-primary-container/10 rounded-full group-hover:bg-primary transition-colors duration-300">
<span className="material-symbols-outlined text-[48px] text-primary group-hover:text-white">local_shipping</span>
</div>
<h3 className="font-title-md text-primary mb-3 uppercase tracking-wider">On-Time Delivery</h3>
<p className="font-body-md text-on-surface-variant">Fresh, Clean Clothes Delivered Right to Your Doorstep.</p>
</div>
</div>
<div className="flex justify-center">
<button onClick={() => setIsModalOpen(true)} className="bg-[#003355] text-white font-label-md px-12 py-4 rounded-full shadow-xl hover:bg-primary hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest">
        Schedule Pickup
      </button>
</div>
</div>
</section><section className="py-section-padding-desktop bg-surface-container-low">
<div className="max-w-[1200px] mx-auto px-6">
<div className="text-center mb-16 space-y-4">
<h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary uppercase tracking-tight">Why Choose Us</h2>
<p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">We've redefined the laundry experience with a focus on quality, sustainability, and your convenience.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<!-- Eco Friendly -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex gap-6 items-start group">
<div className="bg-primary-container/10 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined text-[32px]">eco</span>
</div>
<div className="space-y-2">
<h3 className="font-title-md text-primary uppercase tracking-wider">Eco Friendly</h3>
<p className="font-body-md text-on-surface-variant">We use non-toxic, skin-friendly agents and biodegradable solvents that protect both your garments and the environment.</p>
</div>
</div>
<!-- Price Promise -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex gap-6 items-start group">
<div className="bg-primary-container/10 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined text-[32px]">payments</span>
</div>
<div className="space-y-2">
<h3 className="font-title-md text-primary uppercase tracking-wider">Price Promise</h3>
<p className="font-body-md text-on-surface-variant">Transparent pricing with no hidden fees. Enjoy special rewards and loyalty discounts based on your usage patterns.</p>
</div>
</div>
<!-- Responsive -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex gap-6 items-start group">
<div className="bg-primary-container/10 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined text-[32px]">support_agent</span>
</div>
<div className="space-y-2">
<h3 className="font-title-md text-primary uppercase tracking-wider">Responsive</h3>
<p className="font-body-md text-on-surface-variant">Your feedback drives our innovation. We listen, adapt, and act quickly to ensure your experience is always improving.</p>
</div>
</div>
<!-- Convenient -->
<div className="bg-white p-8 rounded-2xl zero-gravity-shadow border border-outline-variant/20 flex gap-6 items-start group">
<div className="bg-primary-container/10 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
<span className="material-symbols-outlined text-[32px]">schedule</span>
</div>
<div className="space-y-2">
<h3 className="font-title-md text-primary uppercase tracking-wider">Convenient</h3>
<p className="font-body-md text-on-surface-variant">On-demand pickup and delivery with express 6-hour turnarounds. We work around your schedule, not the other way around.</p>
</div>
</div>
</div>
</div>
</section>
<!-- Features Bento Grid -->
<section className="py-section-padding-desktop bg-surface-container-low">
<div className="max-w-[1200px] mx-auto px-6">

</div>
</section>
<!-- Testimonials Section -->
<section className="py-section-padding-desktop bg-white">
<div className="max-w-[1200px] mx-auto px-6">
<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
<div className="space-y-4">
<span className="font-label-md text-primary tracking-widest uppercase">Client Feedback</span>
<h2 className="font-display-lg text-headline-lg md:text-[40px] text-primary">Trusted by Thousands</h2>
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
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<!-- Testimonial 1 -->
<div className="p-8 bg-surface-container-low rounded-xl border border-transparent hover:border-primary/10 transition-all">
<div className="flex gap-1 mb-6 text-primary-container">
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
</div>
<p className="font-body-lg text-on-surface mb-8 italic">"FreshFold has literally given me back my Sundays. The quality of the folding is better than I could ever do myself. It’s like getting a package of brand new clothes every week."</p>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">SC</div>
<div>
<p className="font-title-md text-sm text-primary">Sarah Chen</p>
<p className="font-body-md text-xs text-on-surface-variant">Marketing Executive</p>
</div>
</div>
</div>
<!-- Testimonial 2 -->
<div className="p-8 bg-surface-container-low rounded-xl border border-transparent hover:border-primary/10 transition-all">
<div className="flex gap-1 mb-6 text-primary-container">
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
</div>
<p className="font-body-lg text-on-surface mb-8 italic">"As a busy professional, I appreciate the reliability. They always arrive within their window, and my dry cleaning comes back perfect every single time."</p>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">JM</div>
<div>
<p className="font-title-md text-sm text-primary">James Miller</p>
<p className="font-body-md text-xs text-on-surface-variant">Freelance Designer</p>
</div>
</div>
</div>
<!-- Testimonial 3 -->
<div className="p-8 bg-surface-container-low rounded-xl border border-transparent hover:border-primary/10 transition-all">
<div className="flex gap-1 mb-6 text-primary-container">
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
</div>
<p className="font-body-lg text-on-surface mb-8 italic">"Their eco-friendly process was the main selling point for me. No chemical smell on my clothes, and the convenience is unmatched. Highly recommend!"</p>
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">EL</div>
<div>
<p className="font-title-md text-sm text-primary">Elena Lopez</p>
<p className="font-body-md text-xs text-on-surface-variant">Architect</p>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Final CTA Banner -->
<section className="max-w-[1200px] mx-auto px-6 mb-section-padding-desktop">
<div className="relative bg-primary rounded-xl overflow-hidden p-12 md:p-20 text-center space-y-8 zero-gravity-shadow">
<div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
<div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
<h2 className="relative z-10 font-display-lg text-headline-lg md:text-[48px] text-white">Ready to outsmart your chores?</h2>
<p className="relative z-10 font-body-lg text-white/80 max-w-xl mx-auto">Join over 10,000 satisfied customers who have reclaimed their free time with FreshFold.</p>
<div className="relative z-10 pt-4">
<button onClick={() => setIsModalOpen(true)} className="bg-primary-container text-on-primary-container font-label-md px-10 py-5 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl">Get Started Now</button>
</div>
<p className="relative z-10 font-body-md text-white/60">First pickup is 20% off with code: FRESHSTART</p>
</div>
</section>
<!-- Footer -->
<footer className="w-full py-section-padding-desktop bg-surface-container-low border-t border-outline-variant/20">
<div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6">
<div className="space-y-6">
<a className="text-headline-lg font-headline-lg font-extrabold text-primary tracking-tight" href="/">WASHINGTON</a>
<p className="font-body-md text-on-surface-variant">The gold standard in laundry and dry cleaning logistics. Clean, professional, and always on time.</p>
<div className="flex gap-4">
<a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-sm">face_nod</span></a>
<a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-sm">close</span></a>
<a className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-sm">photo_camera</span></a>
</div>
</div>
<div className="space-y-6">
<h4 className="font-label-md text-sm text-primary uppercase tracking-widest">Company</h4>
<ul className="space-y-4">
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">About Us</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Sustainability</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Careers</a></li>
</ul>
</div>
<div className="space-y-6">
<h4 className="font-label-md text-sm text-primary uppercase tracking-widest">Services</h4>
<ul className="space-y-4">
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Wash &amp; Fold</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Dry Cleaning</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Launder &amp; Press</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Hang Dry</a></li>
</ul>
</div>
<div className="space-y-6">
<h4 className="font-label-md text-sm text-primary uppercase tracking-widest">Support</h4>
<ul className="space-y-4">
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Support</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a></li>
<li className=""><a className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Terms of Service</a></li>
</ul>
</div>
</div>
<div className="max-w-[1200px] mx-auto px-6 pt-16 mt-16 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
<p className="font-body-md text-on-surface-variant text-sm">©️ 2024 FreshFold Premium Logistics. All rights reserved.</p>
<div className="flex gap-8">
<span className="flex items-center gap-2 text-on-surface-variant text-sm"><span className="material-symbols-outlined text-[18px]">public</span> Global Standards</span>
<span className="flex items-center gap-2 text-on-surface-variant text-sm"><span className="material-symbols-outlined text-[18px]">lock</span> Secure Checkout</span>
</div>
</div>
</footer>
{isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="bg-white rounded-2xl p-8" style={{ width: '100%', maxWidth: '500px' }}>
              <h2 className="font-title-md text-primary mb-6" style={{ marginBottom: '1.5rem' }}>Schedule Pickup</h2>
              <form onSubmit={handleCreateOrder}>
                <div className="form-group mb-4">
                  <label className="label block text-sm font-medium text-on-surface-variant mb-2">What needs washing?</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary transition-colors" placeholder="E.g., 5 shirts, 2 pants" 
                    value={newOrder.itemsDescription} onChange={e => setNewOrder({...newOrder, itemsDescription: e.target.value})} />
                </div>
                <div className="form-group mb-6">
                  <label className="label block text-sm font-medium text-on-surface-variant mb-2">Pickup Address</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary transition-colors" placeholder="Full address" 
                    value={newOrder.pickupAddress} onChange={e => setNewOrder({...newOrder, pickupAddress: e.target.value})} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                  <button type="submit" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all">Confirm Booking</button>
                </div>
              </form>
            </div>
          </div>
        )}
</body></html>`;

// Remove HTML comments
const cleanedHtml = html.replace(/<!--[\s\S]*?-->/g, '');

const reactComponent = \`"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ itemsDescription: "", pickupAddress: "" });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user && user.role !== 'CUSTOMER') router.push("/");
    
    if (user && user.role === 'CUSTOMER') {
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/api/orders/my-orders", {
      headers: { Authorization: \`Bearer \${localStorage.getItem("token")}\` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const handleCreateOrder = async (e: any) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: \`Bearer \${localStorage.getItem("token")}\`
      },
      body: JSON.stringify(newOrder),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setNewOrder({ itemsDescription: "", pickupAddress: "" });
      fetchOrders();
    }
  };

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: \`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .zero-gravity-shadow {
            box-shadow: 0 10px 30px -10px rgba(0, 102, 137, 0.1);
            transition: all 0.3s ease-in-out;
        }
        .zero-gravity-shadow:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 102, 137, 0.2);
        }
        .pricing-card-header {
            border-radius: 0.75rem 0.75rem 0 0;
            padding: 2.5rem 1rem 1.75rem;
        }
        .popular-badge {
            position: absolute;
            top: 20px;
            right: -35px;
            background: #ff815a;
            color: #ffffff;
            padding: 8px 40px;
            transform: rotate(45deg);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 10;
        }
        .premium-glow:hover {
            box-shadow: 0 0 20px 2px rgba(43, 177, 231, 0.3);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      \`}} />
      \${cleanedHtml.match(/<nav[\s\S]*<\/body>/)[0].replace(/<\/body>/, '').replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=').replace(/style="([^"]*)"/g, (match, p1) => {
          return \`style={{\${p1.split(';').filter(Boolean).map(s => {
              const [k, v] = s.split(':').map(x => x.trim());
              const camelK = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
              return \`\${camelK}: '\${v}'\`;
          }).join(', ')}}}\`;
      })}
    </>
  );
}
\`;

fs.writeFileSync('app/customer/page.tsx', reactComponent);
console.log("Success!");
