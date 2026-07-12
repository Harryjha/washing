"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user && user.role !== 'ADMIN') router.push("/");
    
    if (user && user.role === 'ADMIN') {
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/api/orders/all", {
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
        <div className="nav-brand">Dashboard (Admin)</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: '600' }}>Hello, {user.name}</span>
          <button onClick={logout} className="btn-primary" style={{ background: 'var(--danger)' }}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-container">
        <h2 style={{ marginBottom: '2rem' }}>All System Orders</h2>

        <div className="grid">
          {orders.map((order: any) => (
            <div key={order.id} className="order-card glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong>Order #{order.id}</strong>
                <select 
                  className="input-field" 
                  style={{ width: 'auto', padding: '0.25rem' }} 
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_WASHING">IN_WASHING</option>
                  <option value="READY_FOR_DELIVERY">READY_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{order.itemsDescription}</p>
              
              <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})<br/>
                <strong>Rider:</strong> {order.rider ? order.rider.name : 'Unassigned'}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p>No orders in the system.</p>}
        </div>
      </main>
    </div>
  );
}
