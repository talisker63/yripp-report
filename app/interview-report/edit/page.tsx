"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { YRIPPFormData } from "@/lib/types/yripp-form";
import { getReport, updateDraftReport, submitReport, ReportDocument } from "@/lib/firebase/reports";
import InterviewReportForm from "@/components/forms/InterviewReportForm";

export default function EditReportPage() {
  return (
    <ProtectedRoute>
      <EditReportContent />
    </ProtectedRoute>
  );
}

function EditReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReportDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [editReason, setEditReason] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const reportId = searchParams.get('id');

  const loadReport = useCallback(async () => {
    if (!reportId || !user) {
      setLoading(false);
      return;
    }

    try {
      const report = await getReport(reportId);
      if (!report) {
        router.push("/reports");
        return;
      }

      const isOwner = report.metadata?.ipId === user.id;
      const isStaff = user.roles?.includes("staff") || false;
      const isSubmitted = report.metadata?.submitted || false;

      if (isOwner && isSubmitted) {
        router.push("/reports");
        return;
      }

      if (isStaff && !isOwner && !isSubmitted) {
        router.push("/reports");
        return;
      }

      if (!isOwner && !isStaff) {
        router.push("/reports");
        return;
      }

      setFormData(report);
    } catch (error) {
      console.error("Error loading report:", error);
      router.push("/reports");
    } finally {
      setLoading(false);
    }
  }, [reportId, user, router]);

  useEffect(() => {
    if (user && reportId) {
      loadReport();
    }
  }, [user, reportId, loadReport]);

  const handleSave = async (data: YRIPPFormData, isSubmission: boolean) => {
    if (!user || !formData?.id) return;

    const isOwner = formData.metadata?.ipId === user.id;
    const isStaff = user.roles?.includes("staff") || false;
    const isSubmitted = formData.metadata?.submitted || false;
    const isDeleted = !!formData.metadata?.deleted;

    if (isSubmitted && isOwner && !isSubmission) {
      throw new Error("You cannot edit a submitted report. Only staff members can edit submitted reports.");
    }

    if (isDeleted) {
      throw new Error("This report's content has been deleted and can no longer be modified.");
    }

    if (!isOwner && isStaff && !isSubmission && !editReason.trim()) {
      setShowEditModal(true);
      setFormData({ ...formData, ...data });
      return;
    }

    try {
      if (isSubmission && isOwner && !isSubmitted) {
        await submitReport(formData.id, user.id);
        router.push("/reports");
      } else {
        await updateDraftReport(
          formData.id,
          data,
          user.id,
          user.roles || [],
          isStaff && !isOwner ? editReason : undefined,
          user.name || undefined
        );
        setFormData({ ...formData, ...data });
        setEditReason("");
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      throw error;
    }
  };

  const handleSaveWithReason = async () => {
    if (!editReason.trim() || !formData) return;
    await handleSave(formData, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!formData && !reportId) {
    return <InterviewReportForm />;
  }

  if (!formData) {
    return null;
  }

  const isOwner = formData.metadata?.ipId === user?.id;
  const isStaff = user?.roles?.includes("staff") || false;
  const isSubmitted = formData.metadata?.submitted || false;
  const isDeleted = !!formData.metadata?.deleted;
  const isReadOnly = isDeleted || (isSubmitted && isOwner);

  return (
    <>
      {formData.metadata?.deleted && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">
                <strong>Report content deleted:</strong> {formData.metadata.deleted.deletedByName} on{" "}
                {new Date(formData.metadata.deleted.deletedAt).toLocaleString("en-AU")}
              </p>
              <p className="text-sm text-red-700 mt-1">{formData.metadata.deleted.deleteReason}</p>
            </div>
          </div>
        </div>
      )}

      {formData.metadata?.editHistory && formData.metadata.editHistory.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Edit History:</strong> This report has been edited by staff/admin.
              </p>
              <ul className="mt-2 text-sm text-yellow-600 list-disc list-inside">
                {formData.metadata.editHistory.map((edit, idx) => (
                  <li key={idx}>
                    {edit.editedByName} ({edit.role}) on {new Date(edit.editedAt).toLocaleDateString()}: {edit.editReason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <InterviewReportForm
        initialData={formData}
        onSave={handleSave}
        isReadOnly={isReadOnly}
        canSubmit={isOwner && !isSubmitted && !isDeleted}
      />

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Reason Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              As staff, you must provide a reason for editing this report.
            </p>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="Enter reason for editing this report..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWithReason}
                disabled={!editReason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
