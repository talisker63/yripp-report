"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/reports");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">YRIPP</h1>
          <p className="text-blue-100">Youth Referral and Independent Person Program</p>
          <p className="text-xs mt-4 opacity-90">Interview Report System</p>
        </div>
        
        {loading ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/signup")}
              >
                Create Account
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              THIS IS A LEGAL DOCUMENT
            </p>
          </>
        )}
      </div>
    </main>
  );
}
