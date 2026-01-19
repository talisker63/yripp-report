"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getReportsByUser, ReportDocument } from "@/lib/firebase/reports";
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
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!authLoading && user) {
      loadReports();
    }
  }, [user, authLoading]);

  const loadReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userReports = await getReportsByUser(user.id, user.roles || []);
      setReports(userReports);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "drafts") return !report.metadata?.submitted;
    if (filter === "submitted") return report.metadata?.submitted;
    return true;
  });

  const isStaff = user?.roles?.includes("staff") || user?.roles?.includes("admin");

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

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setFilter("drafts")}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === "drafts"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilter("submitted")}
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
                {filteredReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isStaff ? 7 : 6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const isSubmitted = report.metadata?.submitted || false;
                    const isOwner = report.metadata?.ipId === user?.id;
                    const canEdit = isOwner && !isSubmitted || isStaff;

                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.sectionA?.interviewDate
                            ? new Date(report.sectionA.interviewDate).toLocaleDateString("en-AU")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.sectionA?.independentPersonName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.sectionA?.policeStation || "-"}
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
                          {report.metadata?.updatedAt
                            ? new Date(report.metadata.updatedAt).toLocaleDateString("en-AU")
                            : "-"}
                        </td>
                        {isStaff && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.metadata?.editHistory && report.metadata.editHistory.length > 0
                              ? `${report.metadata.editHistory.length} edit(s)`
                              : "None"}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {canEdit ? (
                            <button
                              onClick={() => router.push(`/interview-report/edit?id=${report.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => router.push(`/interview-report/edit?id=${report.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
