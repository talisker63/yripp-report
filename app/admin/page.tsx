"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getAllUsers, updateUserRoles, UserProfile } from "@/lib/firebase/users";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, app } from "@/lib/firebase/config";
import { UserRole } from "@/lib/auth/types";
import { Button } from "@/components/ui/Button";

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setError(null);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      console.error("Error loading users:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
        setError("Permission denied. Your admin role may not be set in your authentication token. Please sign out and sign back in.");
      } else {
        setError(error?.message || "Failed to load users");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId: string, role: UserRole, currentRoles: UserRole[]) => {
    try {
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      
      if (newRoles.length === 0) {
        newRoles.push("user");
      }

      await updateUserRoles(userId, newRoles);

      if (app) {
        const functions = getFunctions(app);
        const setUserRole = httpsCallable(functions, "setUserRole");
        const primaryRole = newRoles.includes("admin") ? "admin" : newRoles.includes("staff") ? "staff" : "user";
        await setUserRole({ userId, role: primaryRole, roles: newRoles });
      }

      await loadUsers();
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, roles: newRoles });
      }
    } catch (error: any) {
      console.error("Error updating roles:", error);
      setError(error?.message || "Failed to update user roles");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser || !app) return;

    try {
      const functions = getFunctions(app);
      const adminDeleteUser = httpsCallable(functions, "adminDeleteUser");
      await adminDeleteUser({ userId: deletingUser.id });
      setDeletingUser(null);
      await loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error?.message || "Failed to delete user");
      setDeletingUser(null);
    }
  };

  const handleCreateUser = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const name = formData.get("name") as string;
      const roles: UserRole[] = [];
      
      if (formData.get("role-user") === "on") roles.push("user");
      if (formData.get("role-staff") === "on") roles.push("staff");
      if (formData.get("role-admin") === "on") roles.push("admin");
      
      if (roles.length === 0) roles.push("user");

      if (app) {
        const functions = getFunctions(app);
        const adminCreateUser = httpsCallable(functions, "adminCreateUser");
        await adminCreateUser({ email, password, name, roles });
      }

      setShowCreateForm(false);
      await loadUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      setError(error?.message || "Failed to create user");
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    const emailIndex = headers.findIndex(h => h === "email");
    const nameIndex = headers.findIndex(h => h === "name" || h === "full name");
    const passwordIndex = headers.findIndex(h => h === "password");
    const rolesIndex = headers.findIndex(h => h === "role" || h === "roles");

    if (emailIndex === -1 || nameIndex === -1 || passwordIndex === -1) {
      setError("CSV must have email, name, and password columns");
      return;
    }

    try {
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const email = values[emailIndex];
        const name = values[nameIndex];
        const password = values[passwordIndex];
        const rolesStr = rolesIndex !== -1 ? values[rolesIndex] : "user";
        
        const roles: UserRole[] = rolesStr
          .split(/[,|]/)
          .map(r => r.trim().toLowerCase())
          .filter(r => ["user", "staff", "admin"].includes(r)) as UserRole[];
        
        if (roles.length === 0) roles.push("user");

        if (app) {
          const functions = getFunctions(app);
          const adminCreateUser = httpsCallable(functions, "adminCreateUser");
          await adminCreateUser({ email, password, name, roles });
        }
      }

      setShowCsvUpload(false);
      await loadUsers();
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      setError(error?.message || "Failed to upload users from CSV");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  if (!app) throw new Error("Firebase app not initialized");
                  const functions = getFunctions(app);
                  const syncMyClaims = httpsCallable(functions, "syncMyClaims");
                  await syncMyClaims({});
                  await auth?.currentUser?.getIdToken(true);
                  await loadUsers();
                } catch (e: any) {
                  setError(e?.message || "Failed to sync token");
                }
              }}
            >
              Sync Token
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "Create User"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCsvUpload(!showCsvUpload)}
            >
              {showCsvUpload ? "Cancel" : "Bulk Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/reports")}
            >
              Back to Reports
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form action={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" name="role-user" defaultChecked className="mr-2" />
                    <span>User</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="role-staff" className="mr-2" />
                    <span>Staff</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="role-admin" className="mr-2" />
                    <span>Admin</span>
                  </label>
                </div>
              </div>
              <Button type="submit" variant="primary">Create User</Button>
            </form>
          </div>
        )}

        {showCsvUpload && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Bulk Upload Users</h2>
            <p className="text-sm text-gray-600 mb-4">
              CSV format: email, name, password, roles (comma or pipe-separated)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {u.roles.map((role) => (
                            <span key={role} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {role.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phoneNumber || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setEditingUser(editingUser?.id === u.id ? null : u)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {editingUser?.id === u.id ? "Cancel" : "Edit"}
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.name}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                  <div className="space-y-2">
                    {(["user", "staff", "admin"] as UserRole[]).map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingUser.roles.includes(role)}
                          onChange={() => handleRoleToggle(editingUser.id, role, editingUser.roles)}
                          className="mr-2"
                        />
                        <span className="capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deletingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-red-600">Delete User</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{deletingUser.name}</strong> ({deletingUser.email})?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently remove the user account. Their submitted reports will remain in the system.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeletingUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteUser}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
