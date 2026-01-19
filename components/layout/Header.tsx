"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, signOut, hasRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = hasRole("admin");
  const isStaff = hasRole("staff") || isAdmin;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user) {
    return null;
  }

  const isPublicPage = ["/", "/login", "/signup", "/forgot-password"].includes(pathname || "");

  if (isPublicPage) {
    return null;
  }

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link
              href="/reports"
              className="text-xl font-bold hover:text-blue-200 transition-colors"
            >
              YRIPP
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/reports" 
                    ? "bg-blue-700 text-white" 
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Home
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/admin" 
                      ? "bg-blue-700 text-white" 
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="p-2 text-blue-100 hover:bg-blue-700 rounded-md transition-colors"
              title="Help"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>

            <Link
              href="/settings"
              className={`px-2.5 py-2 rounded-md transition-colors ${
                pathname === "/settings"
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700"
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-blue-100">{user.name || user.email}</span>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Log Out
            </Button>
          </div>
        </div>

        <nav className="md:hidden pb-4 border-t border-blue-500 mt-2 pt-2">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/reports"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/reports" 
                  ? "bg-blue-700 text-white" 
                  : "text-blue-100 hover:bg-blue-700"
              }`}
            >
              Home
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/admin" 
                    ? "bg-blue-700 text-white" 
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}