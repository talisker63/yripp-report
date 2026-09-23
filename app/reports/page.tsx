"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  ReportSummary,
  backfillReportSummaries,
  getReportSummariesPage,
  syncPendingReports,
} from "@/lib/firebase/reports";
import { Button } from "@/components/ui/Button";

type FilterType = "all" | "drafts" | "submitted";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const isStaff = user?.roles?.includes("staff") || user?.roles?.includes("admin");

  const loadPage = useCallback(
    async (reset: boolean, activeFilter: FilterType, pageCursor: DocumentSnapshot | null) => {
      if (!user) return;

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        if (reset) {
          await backfillReportSummaries(user.id, user.roles || []).catch(() => 0);
          await syncPendingReports(user.id, user.roles || [], user.name || undefined).catch(() => 0);
        }

        const page = await getReportSummariesPage(user.id, user.roles || [], {
          filter: activeFilter,
          cursor: reset ? null : pageCursor,
        });

        setReports((prev) => (reset ? page.items : [...prev, ...page.items]));
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (error) {
        console.error("Error loading reports:", error);
        setSyncMessage("Failed to load reports. Check your connection and try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!authLoading && user) {
      loadPage(true, filter, null);
    }
  }, [user, authLoading, filter, loadPage]);

  useEffect(() => {
    if (!user) return;

    const onOnline = () => {
      syncPendingReports(user.id, user.roles || [], user.name || undefined)
        .then((count) => {
          if (count > 0) {
            setSyncMessage(`Synced ${count} local draft${count === 1 ? "" : "s"}.`);
            loadPage(true, filter, null);
          }
        })
        .catch(() => {});
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [user, filter, loadPage]);

  const handleFilterChange = (next: FilterType) => {
    setFilter(next);
    setReports([]);
    setCursor(null);
    setHasMore(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push("/interview-report")}
          >
            New Report
          </Button>
        </div>

        {syncMessage && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {syncMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => handleFilterChange("drafts")}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === "drafts"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => handleFilterChange("submitted")}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === "submitted"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Submitted
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                  {isStaff && (
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
                {reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isStaff ? 7 : 6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const isSubmitted = report.submitted;
                    const isOwner = report.ipId === user?.id;
                    const canEdit = (isOwner && !isSubmitted) || !!isStaff;

                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.interviewDate
                            ? new Date(report.interviewDate).toLocaleDateString("en-AU")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.independentPersonName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.policeStation || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isSubmitted
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isSubmitted ? "Submitted" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.updatedAt
                            ? new Date(report.updatedAt).toLocaleDateString("en-AU")
                            : "-"}
                        </td>
                        {isStaff && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.editHistoryCount > 0
                              ? `${report.editHistoryCount} edit(s)`
                              : "None"}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/interview-report/edit?id=${report.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {canEdit ? "Edit" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="border-t border-gray-200 px-6 py-4 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                disabled={loadingMore}
                onClick={() => loadPage(false, filter, cursor)}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
