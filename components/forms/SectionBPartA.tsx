"use client";

import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { TextArea } from "@/components/ui/TextArea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Checkbox } from "@/components/ui/Checkbox";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionBPartAProps {
  data: YRIPPFormData["sectionBPartA"];
  onChange: (data: YRIPPFormData["sectionBPartA"]) => void;
}

export const SectionBPartA = ({ data, onChange }: SectionBPartAProps) => {
  const updateField = <K extends keyof YRIPPFormData["sectionBPartA"]>(
    field: K,
    value: YRIPPFormData["sectionBPartA"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const immediateNeedsOptions = [
    { value: "water", label: "water" },
    { value: "toilet", label: "toilet" },
    { value: "food", label: "food" },
    { value: "clothesBlanket", label: "clothes/blanket" },
    { value: "sleep", label: "sleep" },
    { value: "medicalTreatment", label: "medical treatment" },
    { value: "other", label: "other", hasOther: true },
  ];

  const policeTreatmentConcernsOptions = [
    { value: "conductOfSearch", label: "conduct of search" },
    { value: "treatmentAtArrest", label: "treatment at arrest" },
    { value: "wordsSaid", label: "words said" },
    { value: "photographsTaken", label: "photographs taken by police" },
    { value: "dnaSample", label: "DNA sample requested/taken" },
    { value: "accessToLegal", label: "access to legal advice" },
    { value: "abilityToContact", label: "ability to contact parent/guardian/friend or relative" },
    { value: "accessToFoodWater", label: "access to food or water" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const ypActionWantedOptions = [
    { value: "seekLegalAdvice", label: "seek legal advice" },
    { value: "raiseWithSergeant", label: "raise with Sergeant now" },
    { value: "formalComplaint", label: "formal complaint later" },
    { value: "noAction", label: "no action now" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  return (
    <FieldGroup
      title="B. YOUNG PERSON'S INFORMATION (PART A)"
      description="Information that the young person has provided to YRIPP in confidence should be noted in this section of the Interview Report."
    >
      <div className="space-y-6">
        <Input
          label="11. YP's preferred first name"
          value={data.preferredFirstName}
          onChange={(e) => updateField("preferredFirstName", e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            12. Does YP have any immediate needs?
          </label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left"></th>
                  <th className="border border-gray-300 p-2 text-center">required</th>
                  <th className="border border-gray-300 p-2 text-center">provided</th>
                  <th className="border border-gray-300 p-2 text-center">not provided</th>
                </tr>
              </thead>
              <tbody>
                {immediateNeedsOptions.map((option) => {
                  const need = data.immediateNeeds.find((n) => n.type === option.value) || {
                    type: option.value,
                    required: false,
                    provided: false,
                    notProvided: false,
                  };
                  return (
                    <tr key={option.value}>
                      <td className="border border-gray-300 p-2 font-medium">{option.label}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={need.required}
                          onChange={(e) => {
                            const updated = data.immediateNeeds.filter((n) => n.type !== option.value);
                            updated.push({ ...need, required: e.target.checked });
                            updateField("immediateNeeds", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={need.provided}
                          onChange={(e) => {
                            const updated = data.immediateNeeds.filter((n) => n.type !== option.value);
                            updated.push({ ...need, provided: e.target.checked });
                            updateField("immediateNeeds", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={need.notProvided}
                          onChange={(e) => {
                            const updated = data.immediateNeeds.filter((n) => n.type !== option.value);
                            updated.push({ ...need, notProvided: e.target.checked });
                            updateField("immediateNeeds", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.immediateNeeds.find((n) => n.type === "other")?.required && (
            <Input
              label="Other (specify)"
              value={data.immediateNeeds.find((n) => n.type === "other")?.other || ""}
              onChange={(e) => {
                const updated = data.immediateNeeds.filter((n) => n.type !== "other");
                updated.push({
                  type: "other",
                  required: true,
                  provided: false,
                  notProvided: false,
                  other: e.target.value,
                });
                updateField("immediateNeeds", updated);
              }}
              className="mt-2"
            />
          )}
        </div>

        <div>
          <RadioGroup
            name="satisfiedWithPoliceTreatment"
            label="13. Is the YP satisfied with police treatment before IP arrived?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.satisfiedWithPoliceTreatment}
            onChange={(value) => updateField("satisfiedWithPoliceTreatment", value as "yes" | "no" | "")}
          />
          {data.satisfiedWithPoliceTreatment === "no" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  If &apos;No&apos;, what are YP concerns about?
                </label>
                <CheckboxGroup
                  options={policeTreatmentConcernsOptions}
                  selectedValues={data.policeTreatmentConcerns}
                  onSelectionChange={(values) => updateField("policeTreatmentConcerns", values)}
                  otherValues={
                    data.policeTreatmentConcernsOther
                      ? { other: data.policeTreatmentConcernsOther }
                      : {}
                  }
                  onOtherValueChange={(_, value) => updateField("policeTreatmentConcernsOther", value)}
                  columns={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  What does YP want to do about their concerns?
                </label>
                <CheckboxGroup
                  options={ypActionWantedOptions}
                  selectedValues={data.ypActionWanted}
                  onSelectionChange={(values) => updateField("ypActionWanted", values)}
                  otherValues={data.ypActionWantedOther ? { other: data.ypActionWantedOther } : {}}
                  onOtherValueChange={(_, value) => updateField("ypActionWantedOther", value)}
                  columns={1}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Do you need to take any action?</label>
          <RadioGroup
            name="actionRequired"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.actionRequired}
            onChange={(value) => updateField("actionRequired", value as "yes" | "no" | "")}
          />
          {data.actionRequired === "yes" && (
            <div className="mt-4 space-y-4">
              <TextArea
                label="If yes, provide details. Describe any injuries."
                value={data.actionDetails || ""}
                onChange={(e) => updateField("actionDetails", e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">14. Gender</label>
          <RadioGroup
            name="gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other, specify" },
            ]}
            value={data.gender}
            onChange={(value) => updateField("gender", value as "male" | "female" | "other" | "")}
          />
          {data.gender === "other" && (
            <Input
              label="Specify"
              value={data.genderOther || ""}
              onChange={(e) => updateField("genderOther", e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="15. Age"
            type="number"
            value={data.age}
            onChange={(e) => updateField("age", e.target.value)}
          />
          <DateInput
            label="Date of birth"
            value={data.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
          />
        </div>

        <Input
          label="16. Who does YP live with?"
          value={data.livingArrangement}
          onChange={(e) => updateField("livingArrangement", e.target.value)}
        />

        <Input
          label="17. In which country was the YP born?"
          value={data.countryOfBirth}
          onChange={(e) => updateField("countryOfBirth", e.target.value)}
        />

        <Input
          label="18. According to the YP what is their cultural identity?"
          value={data.culturalIdentity}
          onChange={(e) => updateField("culturalIdentity", e.target.value)}
        />

        <div>
          <RadioGroup
            name="isATSI"
            label="19. According to the YP, are they Aboriginal or Torres Strait Islander (ATSI)?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.isATSI}
            onChange={(value) => updateField("isATSI", value as "yes" | "no" | "")}
          />
          {data.isATSI === "yes" && (
            <div className="mt-4 space-y-4">
              <RadioGroup
                name="valsContacted"
                label="If YP is ATSI, has VALS spoken with the YP to check if they are OK?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={data.valsContacted}
                onChange={(value) => updateField("valsContacted", value as "yes" | "no" | "")}
              />
              {data.valsContacted === "no" && (
                <Input
                  label="If 'No', why not?"
                  value={data.valsNotContactedReason || ""}
                  onChange={(e) => updateField("valsNotContactedReason", e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <RadioGroup
          name="englishFirstLanguage"
          label="20. According to the YP, is English their first language?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.englishFirstLanguage}
          onChange={(value) => updateField("englishFirstLanguage", value as "yes" | "no" | "")}
        />

        <Input
          label="21. Other than English, what languages does the YP speak at home?*"
          value={data.otherLanguages}
          onChange={(e) => updateField("otherLanguages", e.target.value)}
        />

        <RadioGroup
          name="previousPoliceInterviews"
          label="22. Has the YP ever been interviewed by police at a police station as an alleged offender before?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.previousPoliceInterviews}
          onChange={(value) => updateField("previousPoliceInterviews", value as "yes" | "no" | "")}
        />
      </div>
    </FieldGroup>
  );
};
