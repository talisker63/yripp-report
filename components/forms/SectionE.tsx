"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { TimeInput } from "@/components/ui/TimeInput";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionEProps {
  data: YRIPPFormData["sectionE"];
  onChange: (data: YRIPPFormData["sectionE"]) => void;
}

export const SectionE = ({ data, onChange }: SectionEProps) => {
  const updateField = <K extends keyof YRIPPFormData["sectionE"]>(
    field: K,
    value: YRIPPFormData["sectionE"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const transportationHomeOptions = [
    { value: "police", label: "police" },
    { value: "familyFriend", label: "family or friend" },
    { value: "publicTransport", label: "public transport/walking" },
    { value: "workers", label: "workers" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const whatOccurredOptions = [
    { value: "formalInterview", label: "formal recorded interview" },
    { value: "statementInterview", label: "statement interview" },
    { value: "rebailing", label: "rebailing only" },
    { value: "bailHearing", label: "bail hearing before bail justice" },
    { value: "caution", label: "caution" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const coAccusedSupportOptions = [
    { value: "parentGuardian", label: "parent / guardian" },
    { value: "yripp", label: "YRIPP Independent Person. Name (if known):", hasOther: true },
    { value: "other", label: "Other, specify", hasOther: true },
  ];

  return (
    <FieldGroup title="E. AFTER INTERVIEW">
      <div className="space-y-6">
        <div>
          <RadioGroup
            name="spokeToSergeant"
            label="42. Did you and the YP speak to a Sergeant at the end of the interview process?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.spokeToSergeant}
            onChange={(value) => updateField("spokeToSergeant", value as "yes" | "no" | "")}
          />
          {data.spokeToSergeant === "yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Who was the Sergeant? Rank:"
                value={data.sergeantRank || ""}
                onChange={(e) => updateField("sergeantRank", e.target.value)}
              />
              <Input
                label="Name:"
                value={data.sergeantName || ""}
                onChange={(e) => updateField("sergeantName", e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <RadioGroup
            name="propertyReturned"
            label="43. Did the YP get their property back?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.propertyReturned}
            onChange={(value) => updateField("propertyReturned", value as "yes" | "no" | "")}
          />
          {data.propertyReturned === "no" && (
            <Input
              label="If 'No', what was the reason?"
              value={data.propertyNotReturnedReason || ""}
              onChange={(e) => updateField("propertyNotReturnedReason", e.target.value)}
              className="mt-4"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            44. Were any concerns raised with the Sergeant?
          </label>
          <RadioGroup
            name="concernsRaisedWithSergeant"
            options={[
              { value: "yesByYP", label: "yes by the YP" },
              { value: "yesByIP", label: "yes by the IP" },
              { value: "none", label: "none raised" },
            ]}
            value={data.concernsRaisedWithSergeant}
            onChange={(value) =>
              updateField("concernsRaisedWithSergeant", value as "yesByYP" | "yesByIP" | "none")
            }
          />
          {(data.concernsRaisedWithSergeant === "yesByYP" ||
            data.concernsRaisedWithSergeant === "yesByIP") && (
            <Input
              label="If 'Yes', what were the concerns raised?"
              value={data.concernsRaisedDetails || ""}
              onChange={(e) => updateField("concernsRaisedDetails", e.target.value)}
              className="mt-4"
            />
          )}
        </div>

        <div>
          <RadioGroup
            name="accommodationForNight"
            label="45. Does the YP have accommodation for the night?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={data.accommodationForNight}
            onChange={(value) => updateField("accommodationForNight", value as "yes" | "no" | "")}
          />
          {data.accommodationForNight === "no" && (
            <Input
              label="If 'No', what action was taken and by whom?"
              value={data.accommodationAction || ""}
              onChange={(e) => updateField("accommodationAction", e.target.value)}
              className="mt-4"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">46. How is the YP getting home?</label>
          <CheckboxGroup
            options={transportationHomeOptions}
            selectedValues={data.transportationHome}
            onSelectionChange={(values) => updateField("transportationHome", values)}
            otherValues={data.transportationHomeOther ? { other: data.transportationHomeOther } : {}}
            onOtherValueChange={(_, value) => updateField("transportationHomeOther", value)}
            columns={1}
          />
        </div>

        <RadioGroup
          name="sawYpLeave"
          label="47. Did you see the YP leave the police station?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.sawYpLeave}
          onChange={(value) => updateField("sawYpLeave", value as "yes" | "no" | "")}
        />

        <div>
          <label className="block text-sm font-medium mb-2">48. Which of the following occurred?</label>
          <CheckboxGroup
            options={whatOccurredOptions}
            selectedValues={data.whatOccurred}
            onSelectionChange={(values) => updateField("whatOccurred", values)}
            otherValues={data.whatOccurredOther ? { other: data.whatOccurredOther } : {}}
            onOtherValueChange={(_, value) => updateField("whatOccurredOther", value)}
            columns={1}
          />
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.interviewCancelledAfterLeftHome}
                onChange={(e) => updateField("interviewCancelledAfterLeftHome", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">interview cancelled after you left home</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.interviewCancelledBeforeLeftHome}
                onChange={(e) => updateField("interviewCancelledBeforeLeftHome", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">interview cancelled before you left home</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            49. If a co-accused YP is present, who supported them?
          </label>
          <div className="space-y-2">
            {coAccusedSupportOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`coAccusedSupport-${option.value}`}
                  checked={data.coAccusedSupport === option.value}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateField("coAccusedSupport", option.value);
                    } else {
                      updateField("coAccusedSupport", undefined);
                      if (option.value === "yripp" || option.value === "other") {
                        updateField("coAccusedSupportOther", undefined);
                      }
                    }
                  }}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor={`coAccusedSupport-${option.value}`}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {option.label}
                </label>
                {option.hasOther &&
                  (option.value === "yripp" || option.value === "other") &&
                  data.coAccusedSupport === option.value && (
                    <input
                      type="text"
                      placeholder={option.value === "yripp" ? "Name (if known)" : "Specify"}
                      value={data.coAccusedSupportOther || ""}
                      onChange={(e) => updateField("coAccusedSupportOther", e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
              </div>
            ))}
          </div>
        </div>

        <RadioGroup
          name="wantYRIPPFollowUp"
          label="50. I would like a YRIPP staff member to call me about this call out."
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.wantYRIPPFollowUp}
          onChange={(value) => updateField("wantYRIPPFollowUp", value as "yes" | "no" | "")}
        />

        <TimeInput
          label="51. Time you left the police station"
          value={data.leftStationTime}
          onChange={(e) => updateField("leftStationTime", e.target.value)}
          required
        />
      </div>
    </FieldGroup>
  );
};
