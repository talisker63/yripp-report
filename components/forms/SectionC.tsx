"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Select } from "@/components/ui/Select";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionCProps {
  data: YRIPPFormData["sectionC"];
  onChange: (data: YRIPPFormData["sectionC"]) => void;
  readOnly?: boolean;
}

export const SectionC = ({ data, onChange, readOnly = false }: SectionCProps) => {
  const updateField = <K extends keyof YRIPPFormData["sectionC"]>(
    field: K,
    value: YRIPPFormData["sectionC"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const rightsExplainedOptions = [
    { value: "interviewProcess", label: "interview process" },
    { value: "notObliged", label: "not obliged to say or do anything" },
    { value: "contactFriend", label: "contact friend or relative" },
    { value: "legalAdvice", label: "legal advice / lawyer" },
    {
      value: "fingerprints",
      label:
        "fingerprints (Note: for age 14 and under, consent of both parent/guardian and YP, or a court order required)",
    },
    { value: "photographs", label: "photographs" },
  ];

  const rightsExplainedOptionalOptions = [
    { value: "interpreter", label: "interpreter" },
    { value: "consularOffice", label: "consular office" },
    { value: "medicalAssistance", label: "medical assistance" },
    { value: "itp", label: "independent third person (ITP)" },
  ];

  const stepsTakenOptions = [
    { value: "itpContacted", label: "Independent Third Person (ITP) contacted" },
    { value: "forensicMedical", label: "forensic medical officer contacted" },
    { value: "other", label: "other steps taken, specify", hasOther: true },
  ];

  const yesNoBlankOptions = [
    { value: "", label: "Select" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <FieldGroup
      title="C. INDEPENDENT PERSON OBSERVATIONS"
      description="This section of the Interview Report should not contain confidential information about the young person that has been provided to YRIPP in confidence."
    >
      <div className="space-y-6">
        <FieldGroup title="Pre-Interview">
          <div className="space-y-4">
            <RadioGroup
              name="opportunityToTalkPrivate"
              label="23. Before the taped interview, were you given the opportunity to talk with the YP in private?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={data.opportunityToTalkPrivate}
              onChange={(value) =>
                updateField("opportunityToTalkPrivate", value as "yes" | "no" | "")
              }
              disabled={readOnly}
            />

            {data.opportunityToTalkPrivate === "no" && (
              <div className="space-y-4">
                <RadioGroup
                  name="opportunityToTalkWithPolice"
                  label="If 'No', were you given the opportunity to talk with the YP in the presence of police?"
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  value={data.opportunityToTalkWithPolice}
                  onChange={(value) =>
                    updateField("opportunityToTalkWithPolice", value as "yes" | "no" | "")
                  }
                  disabled={readOnly}
                />

                {(data.opportunityToTalkWithPolice === "no" ||
                  data.opportunityToTalkPrivate === "no") && (
                  <Input
                    label="If 'No', to either of the above, what was the reason?"
                    value={data.reasonNoPrivateTalk || ""}
                    onChange={(e) => updateField("reasonNoPrivateTalk", e.target.value)}
                    disabled={readOnly}
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                24. Have you explained the interview process and each of the rights listed below to the YP?
              </label>
              <CheckboxGroup
                options={rightsExplainedOptions}
                selectedValues={data.rightsExplained}
                onSelectionChange={(values) => updateField("rightsExplained", values)}
                columns={1}
              />
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Optional (as relevant to YP&apos;s circumstances):</label>
                <CheckboxGroup
                  options={rightsExplainedOptionalOptions}
                  selectedValues={data.rightsExplainedOptional}
                  onSelectionChange={(values) => updateField("rightsExplainedOptional", values)}
                  columns={1}
                />
              </div>
            </div>

            <div>
              <RadioGroup
                name="ypUnderstandsRights"
                label="25. Do you believe the YP understands their rights?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={data.ypUnderstandsRights}
                onChange={(value) => updateField("ypUnderstandsRights", value as "yes" | "no" | "")}
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
          </div>
        </FieldGroup>

        <div>
          <label className="block text-sm font-medium mb-2">
            26. Did YP seek to exercise any of their rights?
          </label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left"></th>
                  <th className="border border-gray-300 p-2 text-center w-52">Sought</th>
                  <th className="border border-gray-300 p-2 text-center w-52">Contact made</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "friendOrRelative", label: "friend or relative of YP" },
                  { key: "interpreter", label: "interpreter" },
                  { key: "yrippLegalService", label: "YRIPP 1300 legal service" },
                  { key: "valsLawyer", label: "Victorian Aboriginal Legal Service (lawyer)" },
                  { key: "otherLawyer", label: "other lawyer" },
                ].map(({ key, label }) => {
                  const right = data.ypSoughtRights[key as keyof typeof data.ypSoughtRights];
                  return (
                    <tr key={key}>
                      <td className="border border-gray-300 p-2 font-medium">{label}</td>
                      <td className="border border-gray-300 p-2">
                        <Select
                          value={right?.sought || ""}
                          onChange={(e) => {
                            const sought = e.target.value as "yes" | "no" | "";
                            const updated = {
                              ...data.ypSoughtRights,
                              [key]: {
                                ...right,
                                sought,
                                contactMade: sought === "yes" ? (right?.contactMade || "") : "",
                              },
                            };
                            updateField("ypSoughtRights", updated);
                          }}
                          options={yesNoBlankOptions}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Select
                          value={right?.contactMade || ""}
                          onChange={(e) => {
                            const contactMade = e.target.value as "yes" | "no" | "";
                            const updated = {
                              ...data.ypSoughtRights,
                              [key]: {
                                ...right,
                                contactMade,
                              },
                            };
                            updateField("ypSoughtRights", updated);
                          }}
                          options={yesNoBlankOptions}
                          disabled={readOnly || right?.sought !== "yes"}
                        />
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="border border-gray-300 p-2 font-medium">other:</td>
                  <td className="border border-gray-300 p-2">
                    <Select
                      value={data.ypSoughtRights.other?.sought || ""}
                      onChange={(e) => {
                        const sought = e.target.value as "yes" | "no" | "";
                        updateField("ypSoughtRights", {
                          ...data.ypSoughtRights,
                          other: {
                            ...data.ypSoughtRights.other,
                            sought,
                            contactMade:
                              sought === "yes" ? data.ypSoughtRights.other?.contactMade || "" : "",
                          },
                        });
                      }}
                      options={yesNoBlankOptions}
                      disabled={readOnly}
                    />
                    {data.ypSoughtRights.other?.sought === "yes" && (
                      <Input
                        className="mt-2"
                        placeholder="Specify"
                        value={data.ypSoughtRights.other?.specify || ""}
                        onChange={(e) =>
                          updateField("ypSoughtRights", {
                            ...data.ypSoughtRights,
                            other: { ...data.ypSoughtRights.other, specify: e.target.value },
                          })
                        }
                        disabled={readOnly}
                      />
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Select
                      value={data.ypSoughtRights.other?.contactMade || ""}
                      onChange={(e) => {
                        const contactMade = e.target.value as "yes" | "no" | "";
                        updateField("ypSoughtRights", {
                          ...data.ypSoughtRights,
                          other: { ...data.ypSoughtRights.other, contactMade },
                        });
                      }}
                      options={yesNoBlankOptions}
                      disabled={readOnly || data.ypSoughtRights.other?.sought !== "yes"}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TextArea
            label="If contact was not successful, why not?"
            value={data.contactNotSuccessfulReason || ""}
            onChange={(e) => updateField("contactNotSuccessfulReason", e.target.value)}
            className="mt-4"
            rows={3}
            disabled={readOnly}
          />
        </div>

        <TextArea
          label="27. If the YP did not seek or did not receive legal advice, what was the reason?"
          value={data.reasonNoLegalAdvice || ""}
          onChange={(e) => updateField("reasonNoLegalAdvice", e.target.value)}
          rows={3}
          disabled={readOnly}
        />

        <div>
          <RadioGroup
            name="englishAdequate"
            label="28. Do you think the YP's English is adequate to understand the interview?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.englishAdequate}
            onChange={(value) => updateField("englishAdequate", value as "yes" | "no" | "")}
            disabled={readOnly}
          />
          {data.englishAdequate === "no" && (
            <div className="mt-4 space-y-4">
              <RadioGroup
                name="interpreterContacted"
                label="Has an interpreter been contacted?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={data.interpreterContacted}
                onChange={(value) => updateField("interpreterContacted", value as "yes" | "no" | "")}
                disabled={readOnly}
              />
              <TextArea
                label="If English is not the YP's first language, what makes you think they do not need an interpreter?"
                value={data.whyNoInterpreterNeeded || ""}
                onChange={(e) => updateField("whyNoInterpreterNeeded", e.target.value)}
                rows={3}
                disabled={readOnly}
              />
            </div>
          )}
        </div>

        <div>
          <RadioGroup
            name="fitForInterview"
            label="29. Do you believe the YP is fit for interview and has the capacity to participate in and understand the interview?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.fitForInterview}
            onChange={(value) => updateField("fitForInterview", value as "yes" | "no" | "")}
            disabled={readOnly}
          />
          {data.fitForInterview === "no" && (
            <div className="mt-4 space-y-4">
              <TextArea
                label="If 'No', why not?"
                value={data.notFitReason || ""}
                onChange={(e) => updateField("notFitReason", e.target.value)}
                rows={3}
                disabled={readOnly}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  If &apos;No&apos;, what steps have been taken to address this?
                </label>
                <CheckboxGroup
                  options={stepsTakenOptions}
                  selectedValues={data.stepsTaken}
                  onSelectionChange={(values) => updateField("stepsTaken", values)}
                  otherValues={data.stepsTakenOther ? { other: data.stepsTakenOther } : {}}
                  onOtherValueChange={(_, value) => updateField("stepsTakenOther", value)}
                  columns={1}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </FieldGroup>
  );
};
