"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Create an Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input type="text" name="name" required className="input-field" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" name="email" required className="input-field" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" name="password" required className="input-field" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input type="text" name="phone" required className="input-field" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label">Address</label>
            <input type="text" name="address" required className="input-field" onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
