"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * Wraps a page and redirects if the user is not authenticated
 * or doesn't have one of the allowed roles.
 * Usage: <RouteGuard allowedRoles={["CUSTOMER"]}>{children}</RouteGuard>
 */
export default function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      // Redirect each role to their own dashboard
      if (user.role === "ADMIN") router.replace("/admin");
      else if (user.role === "RIDER") router.replace("/rider");
      else if (user.role === "STORE_ADMIN") router.replace("/store");
      else if (user.role === "CUSTOMER") router.replace("/customer");
      else router.replace("/");
    }
  }, [user, loading]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold text-sm">Authenticating…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
