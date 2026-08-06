"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Very basic verify logic for demo
      fetch("https://washing-3ntw.onrender.com/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("https://washing-3ntw.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setUser(data.user);

      // Check if user locked a pending order before logging in
      const pendingRaw = typeof window !== "undefined" ? localStorage.getItem("pendingOrderData") : null;
      if (pendingRaw && data.user.role === "CUSTOMER") {
        try {
          const payload = JSON.parse(pendingRaw);
          const orderRes = await fetch("https://washing-3ntw.onrender.com/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify(payload),
          });
          localStorage.removeItem("pendingOrderData");
          if (orderRes.ok) {
            router.push("/services?orderSuccess=true");
            return true;
          }
        } catch {}
      }

      if (data.user.role === "CUSTOMER") router.push("/customer");
      if (data.user.role === "RIDER") router.push("/rider");
      if (data.user.role === "ADMIN") router.push("/admin");
      if (data.user.role === "STORE_ADMIN") router.push("/store");

      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
