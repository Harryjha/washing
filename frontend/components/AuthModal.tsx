"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">(mode);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    setLoginError("");
    setRegError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const success = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!success) setLoginError("Invalid email or password. Please try again.");
    else onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      if (res.ok) {
        await login(regForm.email, regForm.password);
        onClose();
      } else {
        const data = await res.json();
        setRegError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden sm:max-w-[440px]">
        {/* Top accent stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        {/* Tab switcher + close */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => switchTab("login")}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === "login" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => switchTab("register")}
            className={`flex-1 py-4 text-sm font-bold transition-all ${
              activeTab === "register" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="px-5 py-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">Welcome back!</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to manage your orders</p>
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email" required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password" required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit" disabled={loginLoading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginLoading && <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>}
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
              <p className="text-center text-sm text-gray-500 pt-2">
                New here?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-primary font-bold hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="text-center mb-4">
                <h2 className="text-xl font-extrabold text-gray-900">Join Washington</h2>
                <p className="text-sm text-gray-500 mt-1">Free pickup, premium care</p>
              </div>
              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                  {regError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" required placeholder="John Smith"
                  value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" required placeholder="you@example.com"
                  value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input type="password" required placeholder="Min 6 chars"
                    value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" required placeholder="+91 98765..."
                    value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                <input type="text" required placeholder="Street, Area, City"
                  value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <button
                type="submit" disabled={regLoading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {regLoading && <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>}
                {regLoading ? "Creating account..." : "Create Account"}
              </button>
              <p className="text-center text-sm text-gray-500 pt-1">
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-primary font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
