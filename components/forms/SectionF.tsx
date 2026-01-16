"use client";

import { TextArea } from "@/components/ui/TextArea";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionFProps {
  data: YRIPPFormData["sectionF"];
  onChange: (data: YRIPPFormData["sectionF"]) => void;
}

export const SectionF = ({ data, onChange }: SectionFProps) => {
  return (
    <FieldGroup
      title="F. ADDITIONAL NOTES"
      description={
        <>
          <p className="mb-2">
            Include anything you think should be noted about the interview, or about your role at the police station if not there for an interview, and the YP&apos;s appearance. Be careful to note anything that seemed unusual about the interview.
          </p>
          <p className="italic text-sm text-gray-700">
            Remember this is a legal document, please make factual statements and refrain from including personal opinions.
          </p>
        </>
      }
    >
      <TextArea
        value={data.additionalNotes}
        onChange={(e) => onChange({ ...data, additionalNotes: e.target.value })}
        rows={28}
        placeholder="Enter additional notes here..."
        className="font-mono text-sm"
      />
    </FieldGroup>
  );
};
