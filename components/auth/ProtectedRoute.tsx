"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "user" | "staff" | "admin" | Array<"user" | "staff" | "admin">;
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (requireRole && !hasRole(requireRole)) {
        router.push("/");
      }
    }
  }, [user, loading, requireRole, hasRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  return <>{children}</>;
};
