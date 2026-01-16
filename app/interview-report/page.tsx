"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import InterviewReportForm from "@/components/forms/InterviewReportForm";

export default function InterviewReportPage() {
  return (
    <ProtectedRoute>
      <InterviewReportForm />
    </ProtectedRoute>
  );
}
