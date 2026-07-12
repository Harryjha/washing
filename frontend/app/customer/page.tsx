"use client";

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
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
        Authorization: `Bearer ${localStorage.getItem("token")}`
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
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
      
      <nav className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md transition-all duration-300 h-20 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 h-full">
          <div className="flex items-center gap-12">
            <a className="text-headline-lg font-headline-lg font-extrabold text-primary tracking-tight" href="/">WASHINGTON</a>
            <div className="hidden md:flex items-center gap-8">
              <a className="font-label-md text-primary font-bold border-b-2 border-primary pb-1 transition-colors duration-200" href="#">Services</a>
              <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">How it Works</a>
              <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Pricing</a>
              <a className="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Testimonials</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={logout} className="hidden md:block font-label-md text-on-surface-variant hover:text-primary px-4 py-2 transition-all">Logout</button>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">Schedule Pickup</button>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-surface">
        <div className="relative min-h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img alt="Laundry background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMfNRsCkjfh6fl3ZFqCnfG_jV5l5sLnGiCCjPFv9z1XA6Lw2R8LKmViAfM4s-9kpyuT6mcVnUnTP4705wUXnwX94umyv21GSbiN71wgT-axAicfp0UeuvIoJQryL8dGS-JCdtc00BFVCYVBuDPujKbCGOT9ZrmYIzwzVQddGiTpmlgVNDhEls_ZeNyzLc4K45mLiyKcRKNEV5eN23PJ-1GUpg9uq87WinX8lsRo36efzIBbVoNJCzLmPu1Q9B6kpYsOqTjtUJYN-w" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 w-full">
            <div className="max-w-2xl space-y-8">
              <h1 className="font-display-lg text-white text-[48px] md:text-[64px] leading-[1.1] font-extrabold uppercase tracking-tight">
                <div><span style={{letterSpacing: "-0.025em"}}>WE'LL HANDLE THE LAUNDRY.</span></div>
                <span className="text-primary-container">YOU ENJOY YOUR DAY</span>
              </h1>
              <p className="font-body-lg text-xl md:text-2xl max-w-lg font-bold uppercase flex flex-wrap gap-x-2">
                <span style={{color: "rgb(76, 175, 80)"}}>WASH,</span> <span style={{color: "rgb(156, 39, 176)"}}>DRY,</span> <span style={{color: "rgb(233, 30, 99)"}}>FOLD,</span> <span style={{color: "rgb(255, 87, 34)"}}>STEAMPRESS.</span>
              </p>
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
      </header>

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
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    order.status === 'DELIVERED' ? 'bg-primary/10 text-primary' : 
                    order.status === 'PENDING' ? 'bg-tertiary-container/20 text-tertiary' : 
                    'bg-secondary-fixed text-secondary'
                  }`}>
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

      <section className="py-section-padding-desktop bg-surface-container-low overflow-hidden pt-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="font-label-md text-primary tracking-widest uppercase font-bold">Our Services</span>
            <h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary">Transparent Pricing for Every Need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
          </div>
        </div>
      </section>

      <section className="py-section-padding-desktop bg-surface overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-lg text-headline-lg md:text-[44px] text-primary uppercase tracking-tight">Items We Process Include</h2>
          </div>
          <div className="relative group">
            <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
              <div className="flex-none w-64 snap-center">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="TOYS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 3% 45% 96%)", transform: "scale(25)"}} />
                  </div>
                  <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">TOYS</span>
                </div>
              </div>
              <div className="flex-none w-64 snap-center">
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-6 zero-gravity-shadow border border-outline-variant/20 hover:scale-105 transition-transform">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVH6VyvBheloJ25BjO3qj6RWfI3E7zzxeoi248TV7Zy-WJPikgZ8XSXnctyoRwVG0HUriOkXrmQxT18sWcm_jXbaNhqlf8Tsd67upMgnSyiF-0jZuuqi7C4eB6NPP3wrkvgPSQX-tozYoaK82c3Fmiq334CTpm7zU1i2Py50DeWwDCY2SfBGImAlepdf4i2utKMSG8sF_rlLFNJi89I_awe7lUeEKVr_7rzUfurC6qoMldB5q4uvuUDcVbku_G_XoRwVoz7JRFf4Q" alt="COATS" className="w-full h-full object-contain" style={{clipPath: "inset(45% 21% 45% 78%)", transform: "scale(25)"}} />
                  </div>
                  <span className="font-label-md text-on-surface-variant font-medium tracking-widest uppercase">COATS</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/40"></div>
              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section-padding-desktop bg-surface-container-low overflow-hidden pt-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 space-y-6">
            <h2 className="font-display-lg text-headline-lg md:text-[48px] text-primary leading-tight">
              <span className="text-primary">Professional laundry care, delivered to your doorstep Makes</span> <span className="text-tertiary relative inline-block">Life Easier!<span className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/30 rounded-full"></span></span>
            </h2>
          </div>
          <div className="flex justify-center">
            <button onClick={() => setIsModalOpen(true)} className="bg-[#003355] text-white font-label-md px-12 py-4 rounded-full shadow-xl hover:bg-primary hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest">
              Schedule Pickup
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full py-section-padding-desktop bg-surface-container-low border-t border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6">
          <div className="space-y-6">
            <a className="text-headline-lg font-headline-lg font-extrabold text-primary tracking-tight" href="/">WASHINGTON</a>
            <p className="font-body-md text-on-surface-variant">The gold standard in laundry and dry cleaning logistics.</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 pt-16 mt-16 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-on-surface-variant text-sm">©️ 2024 FreshFold Premium Logistics. All rights reserved.</p>
        </div>
      </footer>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="bg-white rounded-2xl p-8" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="font-title-md text-primary mb-6" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Schedule Pickup</h2>
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
    </div>
  );
}
