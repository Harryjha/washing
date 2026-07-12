"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function RiderDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user && user.role !== 'RIDER') router.push("/");
    
    if (user && user.role === 'RIDER') {
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/api/orders/rider-orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchOrders();
  };

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">Dashboard (Rider)</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: '600' }}>Hello, {user.name}</span>
          <button onClick={logout} className="btn-primary" style={{ background: 'var(--danger)' }}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-container">
        <h2 style={{ marginBottom: '2rem' }}>Available & My Pickups</h2>

        <div className="grid">
          {orders.map((order: any) => (
            <div key={order.id} className="order-card glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong>Order #{order.id}</strong>
                <span className={`badge ${order.status.toLowerCase().replace('_', '-')}`}>{order.status}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{order.itemsDescription}</p>
              
              <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})<br/>
                <strong>Pickup/Drop:</strong> {order.pickupAddress}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {order.status === 'PENDING' && (
                  <button className="btn-primary" onClick={() => updateStatus(order.id, 'PICKED_UP')}>Accept & Pick Up</button>
                )}
                {order.status === 'PICKED_UP' && (
                  <button className="btn-primary" style={{ background: 'var(--warning)' }} onClick={() => updateStatus(order.id, 'IN_WASHING')}>Drop at Laundry</button>
                )}
                {order.status === 'READY_FOR_DELIVERY' && (
                  <button className="btn-primary" onClick={() => updateStatus(order.id, 'DELIVERED')}>Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p>No orders available at the moment.</p>}
        </div>
      </main>
    </div>
  );
}
