"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { deleteDraftReport, deleteReportContentAsStaff, getReportsByUser } from "@/lib/firebase/reports";
import { ReportDocument } from "@/lib/firebase/reports";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "drafts" | "submitted">("all");
  const [deleteTarget, setDeleteTarget] = useState<ReportDocument | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const allReports = await getReportsByUser(user.id, user.roles || []);
      let filtered = allReports;

      if (filter === "drafts") {
        filtered = allReports.filter((r) => r.metadata?.draft && !r.metadata?.submitted);
      } else if (filter === "submitted") {
        filtered = allReports.filter((r) => r.metadata?.submitted);
      }

      setReports(filtered);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, filter, loadReports]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const openDelete = (report: ReportDocument) => {
    setDeleteError("");
    setDeleteReason("");
    setDeleteTarget(report);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteReason("");
    setDeleteError("");
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget?.id) return;

    const roles = user.roles || [];
    const isAdmin = roles.includes("admin");
    const isStaff = roles.includes("staff");

    if (isAdmin) {
      setDeleteError("Admins cannot delete reports.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (isStaff) {
        await deleteReportContentAsStaff(
          deleteTarget.id,
          { id: user.id, name: user.name, roles },
          deleteReason
        );
      } else {
        await deleteDraftReport(deleteTarget.id, user.id, roles);
      }

      closeDelete();
      await loadReports();
    } catch (error: any) {
      setDeleteError(error?.message || "Failed to delete report");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">YRIPP Reports</h1>
            <p className="text-sm opacity-90">Interview Report Management</p>
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
              href="/settings"
              className="text-white hover:text-blue-200 p-2 rounded hover:bg-white/10"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <span className="text-sm">{user?.name || user?.email}</span>
            {user?.roles && user.roles.length > 0 && (
              <div className="flex gap-1">
                {user.roles.map((role) => (
                  <span key={role} className="text-xs bg-blue-500 px-2 py-1 rounded">
                    {role.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            {user?.roles?.includes("admin") && (
              <Link
                href="/admin"
                className="text-sm text-white hover:text-blue-200 px-3 py-1 border border-white/30 rounded hover:bg-white/10"
              >
                Admin
              </Link>
            )}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "primary" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Reports
            </Button>
            <Button
              variant={filter === "drafts" ? "primary" : "outline"}
              onClick={() => setFilter("drafts")}
            >
              Drafts
            </Button>
            <Button
              variant={filter === "submitted" ? "primary" : "outline"}
              onClick={() => setFilter("submitted")}
            >
              Submitted
            </Button>
          </div>
          <Button type="button" variant="primary" onClick={() => router.push("/interview-report")}>
            New Report
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No reports found</p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push("/interview-report")}
            >
              Create Your First Report
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Independent Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Police Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  {user?.roles?.includes("staff") && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edit History
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.sectionA?.interviewDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.metadata?.ipName || report.sectionA?.independentPersonName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.sectionA?.policeStation || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.metadata?.deleted ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Deleted
                        </span>
                      ) : report.metadata?.submitted ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Submitted
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.metadata?.updatedAt)}
                    </td>
                    {user?.roles?.includes("staff") && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.metadata?.editHistory && report.metadata.editHistory.length > 0 ? (
                          <span className="text-blue-600">
                            {report.metadata.editHistory.length} edit(s)
                          </span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/interview-report/edit?id=${report.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {report.metadata?.submitted && !user?.roles?.includes("staff") ? "View" : "Edit"}
                        </Link>
                        {(() => {
                          const roles = user?.roles || [];
                          const isAdmin = roles.includes("admin");
                          const isStaff = roles.includes("staff");
                          const isOwner = report.metadata?.ipId === user?.id;
                          const isSubmitted = !!report.metadata?.submitted;
                          const isDeleted = !!report.metadata?.deleted;
                          const canDeleteAsStaff = isStaff && !isAdmin && !isDeleted;
                          const canDeleteAsOwner = !isStaff && !isAdmin && isOwner && !isSubmitted;

                          if (!canDeleteAsStaff && !canDeleteAsOwner) return null;

                          return (
                            <button
                              type="button"
                              onClick={() => openDelete(report)}
                              className="text-red-700 hover:text-red-900"
                            >
                              Delete
                            </button>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Delete Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              {user.roles?.includes("staff") && !user.roles?.includes("admin")
                ? "This will delete all report content and keep the report heading details."
                : "This will permanently delete your draft report."}
            </p>

            {user.roles?.includes("staff") && !user.roles?.includes("admin") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter reason for deleting this report..."
                />
              </div>
            )}

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirmDelete}
                disabled={
                  isDeleting ||
                  (user.roles?.includes("staff") &&
                    !user.roles?.includes("admin") &&
                    !deleteReason.trim())
                }
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
