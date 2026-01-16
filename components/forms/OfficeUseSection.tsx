"use client";

import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface OfficeUseSectionProps {
  data: YRIPPFormData["officeUse"];
  onChange: (data: YRIPPFormData["officeUse"]) => void;
}

export const OfficeUseSection = ({ data, onChange }: OfficeUseSectionProps) => {
  const updateField = <K extends keyof YRIPPFormData["officeUse"]>(
    field: K,
    value: YRIPPFormData["officeUse"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300">
      <FieldGroup title="OFFICE USE ONLY - VERSION 2015">
        <div className="space-y-4">
          <Input
            label="Call ID #"
            value={data.callId}
            onChange={(e) => updateField("callId", e.target.value)}
          />
          <Input
            label="Related call ID #"
            value={data.relatedCallId}
            onChange={(e) => updateField("relatedCallId", e.target.value)}
          />
          <RadioGroup
            name="directReferral"
            label="Direct Referral"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.directReferral}
            onChange={(value) => updateField("directReferral", value as "yes" | "no" | "")}
          />
          <Input
            label="IRS received"
            value={data.irsReceived}
            onChange={(e) => updateField("irsReceived", e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Date:"
              value={data.receivedDate}
              onChange={(e) => updateField("receivedDate", e.target.value)}
            />
            <Input
              label="By:"
              value={data.receivedBy}
              onChange={(e) => updateField("receivedBy", e.target.value)}
            />
          </div>
        </div>
      </FieldGroup>
    </div>
  );
};
