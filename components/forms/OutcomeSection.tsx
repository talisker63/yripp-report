"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface OutcomeSectionProps {
  data: YRIPPFormData["outcome"];
  onChange: (data: YRIPPFormData["outcome"]) => void;
  readOnly?: boolean;
}

export const OutcomeSection = ({ data, onChange, readOnly = false }: OutcomeSectionProps) => {
  const updateField = <K extends keyof YRIPPFormData["outcome"]>(
    field: K,
    value: YRIPPFormData["outcome"][K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const interviewOutcomeOptions = [
    {
      value: "releasedWithoutCharge",
      label: "YP released without charge (includes released pending summons)",
    },
    { value: "officialCaution", label: "YP received official police caution" },
    { value: "chargedOnSummons", label: "YP charged on summons" },
    { value: "chargedAndBailed", label: "YP charged and bailed by police" },
    {
      value: "chargedBailRefusedCourt",
      label: "YP charged, bail refused by police and YP to be taken to court",
    },
    {
      value: "chargedBailRefusedHearing",
      label: "YP charged, bail refused by police and police arranging out of hours bail hearing",
    },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const bailHearingSupportOptions = [
    {
      value: "ipDidNotStay",
      label:
        "IP did not stay for bail hearing because CAHABPS present or on their way to police station",
    },
    { value: "bothPresent", label: "both CAHABPS and IP present at bail hearing" },
    {
      value: "phoneAssessment",
      label: "CAHABPS did phone assessment and IP present at bail hearing",
    },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  return (
    <FieldGroup title="Outcome of Interview/Arrest">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            33. What was the outcome for the YP of the interview process or arrest?
          </label>
          <div className="space-y-2">
            {interviewOutcomeOptions.map((option) => (
              <div key={option.value}>
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="interviewOutcome"
                    id={`interviewOutcome-${option.value}`}
                    value={option.value}
                    checked={data.interviewOutcome === option.value}
                  disabled={readOnly}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      updateField("interviewOutcome", newValue);
                      if (newValue !== "other") {
                        updateField("interviewOutcomeOther", undefined);
                      }
                    }}
                    className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />
                  <label
                    htmlFor={`interviewOutcome-${option.value}`}
                    className="text-sm font-medium cursor-pointer select-none block flex-1"
                  >
                    {option.label.replace(", specify", "")}
                  </label>
                </div>
                {option.hasOther && option.value === "other" && data.interviewOutcome === "other" && (
                  <div className="ml-6 mt-2">
                    <Input
                      placeholder="Please specify"
                      value={data.interviewOutcomeOther || ""}
                      onChange={(e) => updateField("interviewOutcomeOther", e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <RadioGroup
            name="ypUnderstoodOutcome"
            label="34. Do you think the YP understood the outcome of the interview process or arrest (eg. bail conditions, intervention order)?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.ypUnderstoodOutcome}
            onChange={(value) => updateField("ypUnderstoodOutcome", value as "yes" | "no" | "")}
            disabled={readOnly}
          />
          <TextArea
            label="What makes you think this?"
            value={data.understandingEvidence || ""}
            onChange={(e) => updateField("understandingEvidence", e.target.value)}
            className="mt-2"
            rows={3}
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            35. If an out of hours bail hearing was conducted, who supported the YP at the hearing?
          </label>
          <div className="space-y-2">
            {bailHearingSupportOptions.map((option) => (
              <div key={option.value} className="flex items-start gap-2">
                <input
                  type="radio"
                  name="bailHearingSupport"
                  id={`bailHearingSupport-${option.value}`}
                  value={option.value}
                  checked={data.bailHearingSupport === option.value}
                  disabled={readOnly}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    updateField("bailHearingSupport", newValue);
                    if (newValue !== "other") {
                      updateField("bailHearingSupportOther", undefined);
                    }
                  }}
                  className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`bailHearingSupport-${option.value}`}
                    className="text-sm font-medium cursor-pointer select-none block"
                  >
                    {option.label.replace(", specify", "")}
                  </label>
                  {option.hasOther && option.value === "other" && data.bailHearingSupport === "other" && (
                    <Input
                      placeholder="Specify"
                      value={data.bailHearingSupportOther || ""}
                      onChange={(e) => updateField("bailHearingSupportOther", e.target.value)}
                      disabled={readOnly}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <RadioGroup
          name="bailHearingOutcome"
          label="36. If known, what was the outcome of the bail hearing?"
          options={[
            { value: "remanded", label: "YP remanded (bail justice refused bail)" },
            { value: "grantedBail", label: "YP granted bail by bail justice" },
            { value: "notApplicable", label: "Not applicable" },
          ]}
          value={data.bailHearingOutcome}
          onChange={(value) =>
            updateField(
              "bailHearingOutcome",
              value as "remanded" | "grantedBail" | "" | "notApplicable"
            )
          }
          disabled={readOnly}
        />
      </div>
    </FieldGroup>
  );
};
