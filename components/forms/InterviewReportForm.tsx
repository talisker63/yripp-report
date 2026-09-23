"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { YRIPPFormData } from "@/lib/types/yripp-form";
import { SectionA } from "@/components/forms/SectionA";
import { SectionBPartA } from "@/components/forms/SectionBPartA";
import { SectionC } from "@/components/forms/SectionC";
import { InterviewSection } from "@/components/forms/InterviewSection";
import { OutcomeSection } from "@/components/forms/OutcomeSection";
import { IPConcernsSection } from "@/components/forms/IPConcernsSection";
import { SectionBPartB } from "@/components/forms/SectionBPartB";
import { SectionE } from "@/components/forms/SectionE";
import { SectionF } from "@/components/forms/SectionF";
import { OfficeUseSection } from "@/components/forms/OfficeUseSection";
import { Button } from "@/components/ui/Button";
import { createDraftReport, updateDraftReport, submitReport, ReportDocument, SaveReportResult } from "@/lib/firebase/reports";
import { useAuth } from "@/lib/auth/context";
import { createInitialFormData } from "@/lib/yripp/initialFormData";

interface InterviewReportFormProps {
  initialData?: YRIPPFormData | ReportDocument;
  onSave?: (data: YRIPPFormData, isSubmission: boolean) => Promise<SaveReportResult | void>;
  isReadOnly?: boolean;
  canSubmit?: boolean;
}

export default function InterviewReportForm({
  initialData,
  onSave,
  isReadOnly = false,
  canSubmit = true,
}: InterviewReportFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const initialFormDataRef = useRef<YRIPPFormData | ReportDocument>(
    initialData || createInitialFormData()
  );
  const [formData, setFormData] = useState<YRIPPFormData | ReportDocument>(
    initialFormDataRef.current
  );
  const [currentSection, setCurrentSection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const sections = [
    { id: 1, title: "A. Call Out and Arrival", component: "sectionA" },
    { id: 2, title: "B. Young Person Information (Part A)", component: "sectionBPartA" },
    { id: 3, title: "C. Independent Person Observations", component: "sectionC" },
    { id: 4, title: "Interview", component: "interview" },
    { id: 5, title: "Outcome", component: "outcome" },
    { id: 6, title: "IP Concerns", component: "ipConcerns" },
    { id: 7, title: "D. Young Person Information (Part B)", component: "sectionBPartB" },
    { id: 8, title: "E. After Interview", component: "sectionE" },
    { id: 9, title: "F. Additional Notes", component: "sectionF" },
    { id: 10, title: "Office Use Only", component: "officeUse" },
  ];

  const hasUnsavedChanges = () => {
    const initial = initialFormDataRef.current;
    const current = formData;
    
    const normalizeForComparison = (data: any) => {
      const normalized = JSON.parse(JSON.stringify(data));
      delete normalized.metadata?.updatedAt;
      delete normalized.metadata?.createdAt;
      delete normalized.id;
      return JSON.stringify(normalized);
    };
    
    return normalizeForComparison(initial) !== normalizeForComparison(current);
  };

  const handleHeaderClick = () => {
    if (isReadOnly) {
      router.push("/interview-report");
      return;
    }
    
    if (hasUnsavedChanges()) {
      setShowUnsavedModal(true);
    } else {
      router.push("/interview-report");
    }
  };

  const handleSaveAndNavigate = async () => {
    if (!user) {
      router.push("/interview-report");
      return;
    }
    
    setIsSaving(true);
    setSaveError("");
    setSyncNotice("");
    
    try {
      const updatedData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      
      let result: SaveReportResult | void;
      if (onSave) {
        result = await onSave(updatedData, false);
      } else if ('id' in formData && formData.id) {
        result = await updateDraftReport(
          formData.id,
          updatedData,
          user.id,
          user.roles || [],
          undefined,
          user.name || undefined
        );
      } else {
        result = await createDraftReport(
          updatedData,
          user.id,
          user.name || undefined
        );
      }

      if (result && !result.synced) {
        setSyncNotice(result.syncError || "Saved locally. Will sync when online.");
      }
      
      router.push("/interview-report");
    } catch (error: any) {
      setSaveError(error.message || "Failed to save draft");
      setIsSaving(false);
    }
  };

  const handleDiscardAndNavigate = () => {
    setShowUnsavedModal(false);
    router.push("/interview-report");
  };

  const updateFormData = (section: keyof YRIPPFormData, data: any) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveError("");
    setSyncNotice("");

    try {
      const updatedData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

      let result: SaveReportResult | void;
      if (onSave) {
        result = await onSave(updatedData, false);
      } else if ('id' in formData && formData.id) {
        result = await updateDraftReport(
          formData.id,
          updatedData,
          user.id,
          user.roles || [],
          undefined,
          user.name || undefined
        );
      } else {
        result = await createDraftReport(
          updatedData,
          user.id,
          user.name || undefined
        );
        if (result?.id) {
          setFormData({ ...updatedData, id: result.id } as ReportDocument);
          initialFormDataRef.current = { ...updatedData, id: result.id } as ReportDocument;
          router.push(`/interview-report/edit?id=${result.id}`);
        }
      }

      if (result && !result.synced) {
        setSyncNotice(result.syncError || "Saved locally. Will sync when online.");
      } else if (result?.synced) {
        setSyncNotice("Saved and synced.");
        initialFormDataRef.current = ('id' in formData && formData.id)
          ? { ...updatedData, id: formData.id } as ReportDocument
          : { ...updatedData, id: result.id } as ReportDocument;
      }
    } catch (error: any) {
      setSaveError(error.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = (data: YRIPPFormData | ReportDocument): string[] => {
    const missingQuestions: string[] = [];

    if (!data.sectionA?.independentPersonName?.trim()) missingQuestions.push("1. Name of Independent Person");
    if (!data.sectionA?.policeStation?.trim()) missingQuestions.push("2. Police station");
    if (!data.sectionA?.interviewDate?.trim()) missingQuestions.push("3. Date of interview");
    if (!data.sectionA?.callTime?.trim()) missingQuestions.push("4. Time of call from call centre operator");
    if (!data.sectionA?.policeContact?.rank?.trim()) missingQuestions.push("5. Police contact - Rank");
    if (!data.sectionA?.policeContact?.name?.trim()) missingQuestions.push("5. Police contact - Name");
    if (!data.sectionA?.policeContact?.section?.trim()) missingQuestions.push("5. Police contact - Section");
    if (data.sectionA?.policeContact?.section === "other" && !data.sectionA?.policeContact?.sectionOther?.trim()) {
      missingQuestions.push("5. Police contact - Section (Please specify 'other')");
    }
    if (!data.sectionA?.arrivalTime?.trim()) missingQuestions.push("6. Time you arrived at the police station");
    if (!data.sectionA?.parentNotAttendingReason || data.sectionA.parentNotAttendingReason.length === 0) {
      missingQuestions.push("7. Reason for parent or guardian not attending");
    }
    if (!data.sectionA?.custodyDuration?.trim()) missingQuestions.push("8. How long has the YP been in custody?");
    if (!data.sectionA?.mainOffenceTypes?.crimesAgainstPerson || data.sectionA.mainOffenceTypes.crimesAgainstPerson.length === 0) {
      if (!data.sectionA?.mainOffenceTypes?.drugs || data.sectionA.mainOffenceTypes.drugs.length === 0) {
        if (!data.sectionA?.mainOffenceTypes?.crimesAgainstProperty || data.sectionA.mainOffenceTypes.crimesAgainstProperty.length === 0) {
          if (!data.sectionA?.mainOffenceTypes?.other || data.sectionA.mainOffenceTypes.other.length === 0) {
            missingQuestions.push("9. What are the main types of offences that the YP is being interviewed about?");
          }
        }
      }
    }
    if (!data.sectionA?.offenceOccurredInDHHS) missingQuestions.push("10. Did the offence occur in DHHS residential unit?");

    if (!data.sectionBPartA?.preferredFirstName?.trim()) missingQuestions.push("11. YP's preferred first name");
    if (!data.sectionBPartA?.satisfiedWithPoliceTreatment) missingQuestions.push("13. Is the YP satisfied with police treatment before IP arrived?");
    if (!data.sectionBPartA?.gender) missingQuestions.push("14. Gender");
    if (!data.sectionBPartA?.age?.trim()) missingQuestions.push("15. Age");
    if (!data.sectionBPartA?.dateOfBirth?.trim()) missingQuestions.push("15. Date of birth");
    if (!data.sectionBPartA?.livingArrangement?.trim()) missingQuestions.push("16. Who does YP live with?");
    if (!data.sectionBPartA?.countryOfBirth?.trim()) missingQuestions.push("17. In which country was the YP born?");
    if (!data.sectionBPartA?.culturalIdentity?.trim()) missingQuestions.push("18. According to the YP what is their cultural identity?");
    if (!data.sectionBPartA?.isATSI) missingQuestions.push("19. According to the YP, are they Aboriginal or Torres Strait Islander (ATSI)?");
    if (!data.sectionBPartA?.englishFirstLanguage) missingQuestions.push("20. According to the YP, is English their first language?");
    if (!data.sectionBPartA?.otherLanguages?.trim()) missingQuestions.push("21. Other than English, what languages does the YP speak at home?");
    if (!data.sectionBPartA?.previousPoliceInterviews) missingQuestions.push("22. Has the YP ever been interviewed by police at a police station as an alleged offender before?");

    if (!data.sectionC?.opportunityToTalkPrivate) missingQuestions.push("23. Before the taped interview, were you given the opportunity to talk with the YP in private?");
    if (!data.sectionC?.rightsExplained || data.sectionC.rightsExplained.length === 0) {
      missingQuestions.push("24. Have you explained the interview process and each of the rights listed below to the YP?");
    }
    if (!data.sectionC?.ypUnderstandsRights) missingQuestions.push("25. Do you believe the YP understands their rights?");
    if (!data.sectionC?.reasonNoLegalAdvice?.trim()) missingQuestions.push("27. If the YP did not seek or did not receive legal advice, what was the reason?");
    if (!data.sectionC?.englishAdequate) missingQuestions.push("28. Do you think the YP's English is adequate to understand the interview?");
    if (!data.sectionC?.fitForInterview) missingQuestions.push("29. Do you believe the YP is fit for interview and has the capacity to participate in and understand the interview?");

    if (!data.interview?.informant?.rank?.trim()) missingQuestions.push("30. Interviewing officers - Informant Rank");
    if (!data.interview?.informant?.name?.trim()) missingQuestions.push("30. Interviewing officers - Informant Name");
    if (!data.interview?.informant?.badgeNumber?.trim()) missingQuestions.push("30. Interviewing officers - Informant Badge Number");
    if (!data.interview?.corroborator?.rank?.trim()) missingQuestions.push("30. Interviewing officers - Corroborator Rank");
    if (!data.interview?.corroborator?.name?.trim()) missingQuestions.push("30. Interviewing officers - Corroborator Name");
    if (!data.interview?.corroborator?.badgeNumber?.trim()) missingQuestions.push("30. Interviewing officers - Corroborator Badge Number");
    if (!data.interview?.interviewTimes?.commenced?.trim()) missingQuestions.push("31. Interview times - commenced");
    if (!data.interview?.interviewTimes?.concluded?.trim()) missingQuestions.push("31. Interview times - concluded");
    const witnessedActions = data.interview?.witnessedActions;
    if (!witnessedActions || witnessedActions.length === 0 || 
        witnessedActions.every(action => !action.witnessed)) {
      missingQuestions.push("32. Did you witness any of the following? And were the following done with or without the YP's consent?");
    }

    if (!data.outcome?.interviewOutcome) missingQuestions.push("33. What was the outcome for the YP of the interview process or arrest?");
    if (data.outcome?.interviewOutcome === "other" && !data.outcome?.interviewOutcomeOther?.trim()) {
      missingQuestions.push("33. What was the outcome for the YP of the interview process or arrest? (Please specify 'other')");
    }
    if (!data.outcome?.ypUnderstoodOutcome) missingQuestions.push("34. Do you think the YP understood the outcome of the interview process or arrest?");

    if (!data.ipConcerns?.hasConcerns) missingQuestions.push("37. From what you have witnessed, do you have any concerns about the treatment of the YP, the process or the YP's welfare?");

    if (!data.sectionBPartB?.hasWorker || data.sectionBPartB.hasWorker.length === 0) {
      missingQuestions.push("38. Does the YP have a 'worker'?");
    }
    const referralServices = data.sectionBPartB?.referralServices;
    const hasReferral = referralServices && Object.values(referralServices).some(
      (service: any) => service?.faxed === true || service?.card === true
    );
    if (!hasReferral && !data.sectionBPartB?.referralNotWantedReason?.trim()) {
      missingQuestions.push("40. If YP did not want a referral, what were the reasons?");
    }
    if (!data.sectionBPartB?.happyWithTreatment) missingQuestions.push("41. Was the YP happy with their treatment by police and with the interview process?");

    if (!data.sectionE?.spokeToSergeant) missingQuestions.push("42. Did you and the YP speak to a Sergeant at the end of the interview process?");
    if (!data.sectionE?.propertyReturned) missingQuestions.push("43. Did the YP get their property back?");
    if (!data.sectionE?.concernsRaisedWithSergeant) missingQuestions.push("44. Were any concerns raised with the Sergeant?");
    if (!data.sectionE?.accommodationForNight) missingQuestions.push("45. Does the YP have accommodation for the night?");
    if (!data.sectionE?.transportationHome || data.sectionE.transportationHome.length === 0) {
      missingQuestions.push("46. How is the YP getting home?");
    }
    if (!data.sectionE?.sawYpLeave) missingQuestions.push("47. Did you see the YP leave the police station?");
    if (!data.sectionE?.whatOccurred || data.sectionE.whatOccurred.length === 0) {
      missingQuestions.push("48. Which of the following occurred?");
    }
    if (!data.sectionE?.wantYRIPPFollowUp) missingQuestions.push("50. I would like a YRIPP staff member to call me about this call out.");
    if (!data.sectionE?.leftStationTime?.trim()) missingQuestions.push("51. Time you left the police station");

    return missingQuestions;
  };

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;

    const missingQuestions = validateForm(formData);
    if (missingQuestions.length > 0) {
      const errorMessage = `Missing questions (${missingQuestions.length}):\n${missingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
      setSaveError(errorMessage);
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const updatedData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

      if (onSave) {
        await onSave(updatedData, true);
      } else if ('id' in formData && formData.id) {
        await submitReport(formData.id, user.id);
        router.push("/reports");
      }
    } catch (error: any) {
      setSaveError(error.message || "Failed to submit report");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = () => {
    const sectionProps = isReadOnly ? { readOnly: true } : {};
    
    switch (currentSection) {
      case 1:
        return (
          <SectionA
            data={formData.sectionA}
            onChange={(data) => updateFormData("sectionA", data)}
            {...sectionProps}
          />
        );
      case 2:
        return (
          <SectionBPartA
            data={formData.sectionBPartA}
            onChange={(data) => updateFormData("sectionBPartA", data)}
            {...sectionProps}
          />
        );
      case 3:
        return (
          <SectionC
            data={formData.sectionC}
            onChange={(data) => updateFormData("sectionC", data)}
            {...sectionProps}
          />
        );
      case 4:
        return (
          <InterviewSection
            data={formData.interview}
            onChange={(data) => updateFormData("interview", data)}
            {...sectionProps}
          />
        );
      case 5:
        return (
          <OutcomeSection
            data={formData.outcome}
            onChange={(data) => updateFormData("outcome", data)}
            {...sectionProps}
          />
        );
      case 6:
        return (
          <IPConcernsSection
            data={formData.ipConcerns}
            onChange={(data) => updateFormData("ipConcerns", data)}
            {...sectionProps}
          />
        );
      case 7:
        return (
          <SectionBPartB
            data={formData.sectionBPartB}
            onChange={(data) => updateFormData("sectionBPartB", data)}
            {...sectionProps}
          />
        );
      case 8:
        return (
          <SectionE
            data={formData.sectionE}
            onChange={(data) => updateFormData("sectionE", data)}
            {...sectionProps}
          />
        );
      case 9:
        return (
          <SectionF
            data={formData.sectionF}
            onChange={(data) => updateFormData("sectionF", data)}
            {...sectionProps}
          />
        );
      case 10:
        return (
          <OfficeUseSection
            data={formData.officeUse}
            onChange={(data) => updateFormData("officeUse", data)}
            {...sectionProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 
              className="text-xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleHeaderClick}
            >
              YRIPP INTERVIEW REPORT
            </h1>
            <p className="text-sm opacity-90">Youth Referral and Independent Person Program</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">THIS IS A LEGAL DOCUMENT</p>
            {isReadOnly && <p className="text-xs opacity-75 mt-1">READ ONLY</p>}
          </div>
        </div>
      </header>

      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 mb-4">
              You have unsaved changes. Would you like to save your draft before starting a new report?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDiscardAndNavigate}
                disabled={isSaving}
              >
                Discard Changes
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAndNavigate}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {syncNotice && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            {syncNotice}
          </div>
        )}
        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="font-semibold mb-2">Please complete all mandatory questions before submitting.</div>
            {saveError.includes("Missing questions") && (
              <div className="mt-2">
                <div className="font-medium mb-1">Missing questions:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {saveError.split("\n").filter(line => line.trim() && line.match(/^\d+\./)).map((line, idx) => (
                    <li key={idx}>{line.replace(/^\d+\.\s*/, "")}</li>
                  ))}
                </ul>
              </div>
            )}
            {!saveError.includes("Missing questions") && <div>{saveError}</div>}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {sections.find((s) => s.id === currentSection)?.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Section {currentSection} of {sections.length}
              </p>
            </div>
            {!isReadOnly && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="text-sm"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            )}
          </div>

          {renderSection()}
        </div>

        <div className="flex justify-between gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
          <Button
            variant="outline"
            onClick={() => setCurrentSection((prev) => Math.max(1, prev - 1))}
            disabled={currentSection === 1 || isReadOnly}
          >
            Previous
          </Button>
          <div className="flex gap-2 flex-wrap justify-center">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => !isReadOnly && setCurrentSection(section.id)}
                className={`w-8 h-8 rounded text-xs font-medium ${
                  currentSection === section.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${isReadOnly && currentSection !== section.id ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isReadOnly && currentSection !== section.id}
              >
                {section.id}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() =>
                !isReadOnly && setCurrentSection((prev) => Math.min(sections.length, prev + 1))
              }
              disabled={currentSection === sections.length || isReadOnly}
            >
              Next
            </Button>
            {canSubmit && !formData.metadata?.submitted && !isReadOnly && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "Submitting..." : "Submit Report"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
