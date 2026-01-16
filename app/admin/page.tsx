"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getAllUsers, updateUserRoles, createUserProfile } from "@/lib/firebase/users";
import { UserProfile } from "@/lib/firebase/users";
import { UserRole } from "@/lib/auth/types";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    roles: [] as UserRole[],
  });

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, role: UserRole, currentRoles: UserRole[]) => {
    try {
      let newRoles: UserRole[];
      if (currentRoles.includes(role)) {
        newRoles = currentRoles.filter((r) => r !== role);
      } else {
        newRoles = [...currentRoles, role];
      }
      
      if (newRoles.length === 0) {
        newRoles = ["user"];
      }
      
      await updateUserRoles(userId, newRoles);

      if (functions) {
        try {
          const setUserRole = httpsCallable(functions, "setUserRole");
          const primaryRole = newRoles.includes("admin") ? "admin" : newRoles.includes("staff") ? "staff" : "user";
          await setUserRole({ userId, role: primaryRole });
        } catch (error) {
          console.error("Error updating custom claims:", error);
        }
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u))
      );
    } catch (error: any) {
      console.error("Error updating roles:", error);
      alert(error.message || "Failed to update user roles");
      await loadUsers();
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      if (!auth) throw new Error("Auth not initialized");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      await updateProfile(userCredential.user, { displayName: newUser.name });

      await createUserProfile(
        userCredential.user.uid,
        newUser.email,
        newUser.name,
        newUser.roles.length > 0 ? newUser.roles : ["user"]
      );

      if (newUser.roles.length > 0 && functions) {
        try {
          const setUserRole = httpsCallable(functions, "setUserRole");
          const primaryRole = newUser.roles.includes("admin") ? "admin" : newUser.roles.includes("staff") ? "staff" : "user";
          await setUserRole({ userId: userCredential.user.uid, role: primaryRole });
        } catch (error) {
          console.error("Error setting custom claims:", error);
        }
      }

      setNewUser({ email: "", name: "", password: "", roles: [] });
      setShowCreateUser(false);
      await loadUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(error.message || "Failed to create user");
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    const text = await csvFile.text();
    const lines = text.split("\n").filter((line) => line.trim());
    
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, ""));

    const emailIndex = headers.findIndex((h) => h.includes("email"));
    const nameIndex = headers.findIndex((h) => h.includes("name") && !h.includes("first") && !h.includes("last"));
    const roleIndex = headers.findIndex((h) => h.includes("role"));

    if (emailIndex === -1 || nameIndex === -1) {
      alert("CSV must contain 'email' and 'name' columns");
      return;
    }

    const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
    if (!auth) throw new Error("Auth not initialized");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, "").trim());
      const email = values[emailIndex];
      const name = values[nameIndex];
      const roleStr = roleIndex >= 0 ? values[roleIndex] : "user";
      const roles: UserRole[] = roleStr
        .split(/[|,]/)
        .map((r) => r.trim().toLowerCase())
        .filter((r) => ["user", "staff", "admin"].includes(r)) as UserRole[];

      if (!email || !name) continue;

      try {
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        await updateProfile(userCredential.user, { displayName: name });

        await createUserProfile(
          userCredential.user.uid,
          email,
          name,
          roles.length > 0 ? roles : ["user"]
        );

        if (roles.length > 0 && functions) {
          try {
            const setUserRole = httpsCallable(functions, "setUserRole");
            const primaryRole = roles.includes("admin") ? "admin" : roles.includes("staff") ? "staff" : "user";
            await setUserRole({ userId: userCredential.user.uid, role: primaryRole });
          } catch (error) {
            console.error("Error setting custom claims:", error);
          }
        }

        successCount++;
      } catch (error: any) {
        console.error(`Error creating user ${email}:`, error);
        errorCount++;
      }
    }

    alert(`Upload complete: ${successCount} users created, ${errorCount} errors`);
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await loadUsers();
  };

  const functions = auth && typeof window !== "undefined" ? getFunctions(auth.app) : null;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm opacity-90">User Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="text-white hover:text-blue-200 p-2 rounded hover:bg-white/10"
              title="Help"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link
              href="/reports"
              className="text-sm text-white hover:text-blue-200 px-3 py-1 border border-white/30 rounded hover:bg-white/10"
            >
              Reports
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="text-sm text-white hover:text-blue-200 px-3 py-1 border border-white/30 rounded hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <Button
            variant="primary"
            onClick={() => setShowCreateUser(!showCreateUser)}
          >
            {showCreateUser ? "Cancel" : "Create New User"}
          </Button>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              Upload CSV
            </label>
            {csvFile && (
              <>
                <span className="text-sm text-gray-600">{csvFile.name}</span>
                <Button variant="primary" onClick={handleCsvUpload}>
                  Process CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {showCreateUser && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <Input
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Roles</label>
                <div className="flex gap-4">
                  {(["user", "staff", "admin"] as UserRole[]).map((role) => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newUser.roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewUser({
                              ...newUser,
                              roles: [...newUser.roles, role],
                            });
                          } else {
                            setNewUser({
                              ...newUser,
                              roles: newUser.roles.filter((r) => r !== role),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button variant="primary" onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.phoneNumber || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {(["user", "staff", "admin"] as UserRole[]).map((role) => (
                        <label key={role} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={u.roles.includes(role)}
                            onChange={() => handleRoleToggle(u.id, role, u.roles)}
                            className="rounded"
                          />
                          <span className="text-xs capitalize px-2 py-1 rounded bg-gray-100">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
