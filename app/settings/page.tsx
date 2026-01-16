"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/users";
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setName(profile.name);
        setEmail(profile.email);
        setPhoneNumber(profile.phoneNumber || "");
      } else {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateUserProfile(user.id, { name: name.trim() });
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      setSuccess("Name updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateUserProfile(user.id, { phoneNumber: phoneNumber.trim() || undefined });
      setSuccess("Phone number updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update phone number");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !auth?.currentUser || !newEmail.trim() || !currentPassword) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!auth.currentUser) return;
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail.trim());
      setSuccess("Email updated successfully. Please sign in again.");
      setTimeout(() => {
        signOut();
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to update email");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">User Settings</h1>
            <p className="text-sm opacity-90">Manage your account</p>
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
            <Button
              variant="outline"
              onClick={() => router.push("/reports")}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Back to Reports
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
              <Button
                variant="primary"
                onClick={handleUpdateName}
                disabled={saving || !name.trim()}
                className="mt-2"
              >
                {saving ? "Saving..." : "Update Name"}
              </Button>
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+61 4XX XXX XXX"
                disabled={saving}
              />
              <Button
                variant="primary"
                onClick={handleUpdatePhone}
                disabled={saving}
                className="mt-2"
              >
                {saving ? "Saving..." : "Update Phone Number"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">Email Address</h2>
          <p className="text-sm text-gray-600 mb-4">Current email: {email}</p>

          <div className="space-y-4">
            <Input
              label="New Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              disabled={saving}
            />
            <Input
              label="Current Password (required to change email)"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={saving}
            />
            <Button
              variant="primary"
              onClick={handleUpdateEmail}
              disabled={saving || !newEmail.trim() || !currentPassword}
            >
              {saving ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
