"use client";

import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Select } from "@/components/ui/Select";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionAProps {
  data: YRIPPFormData["sectionA"];
  onChange: (data: YRIPPFormData["sectionA"]) => void;
  readOnly?: boolean;
}

export const SectionA = ({ data, onChange, readOnly = false }: SectionAProps) => {
  const updateField = <K extends keyof YRIPPFormData["sectionA"]>(
    field: K,
    value: YRIPPFormData["sectionA"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const parentNotAttendingOptions = [
    { value: "ypInDHHS", label: "YP in DHHS or residential care" },
    { value: "couldNotAttend", label: "could not attend" },
    { value: "refusedToAttend", label: "refused to attend" },
    { value: "notContactable", label: "not contactable" },
    { value: "ypChoseNotToContact", label: "YP chose not to contact parents" },
    { value: "parentIsVictim", label: "parent is victim, witness or co-accused" },
    { value: "interventionOrder", label: "intervention order in place" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const crimesAgainstPersonOptions = [
    { value: "assaultAffray", label: "assault / affray" },
    { value: "homicide", label: "homicide" },
    { value: "robbery", label: "robbery / armed robbery" },
    { value: "sexualAssault", label: "sexual assault / rape" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const drugsOptions = [
    { value: "cultivate", label: "cultivate / manufacture / traffick" },
    { value: "possess", label: "possess / use" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const crimesAgainstPropertyOptions = [
    { value: "theft", label: "theft / shopsteal" },
    { value: "stolenGoods", label: "handle stolen goods / going equipped to steal" },
    { value: "carTheft", label: "car related thefts" },
    { value: "propertyDamage", label: "property damage (wilful / criminal damage)" },
    { value: "burglary", label: "burglary / aggravated burglary" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const otherOffencesOptions = [
    { value: "weapon", label: "weapon offences" },
    { value: "behaviour", label: "behaviour offences" },
    { value: "breachIntervention", label: "breach of intervention order" },
    { value: "breachBail", label: "breach of bail conditions" },
    { value: "driving", label: "driving offences" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const policeSectionOptions = [
    { value: "", label: "Select section" },
    { value: "uniform", label: "Uniform" },
    { value: "ciu", label: "CIU" },
    { value: "socit", label: "SOCIT" },
    { value: "other", label: "Other" },
  ];

  const policeSectionKnown = new Set(policeSectionOptions.map((o) => o.value).filter(Boolean));
  const policeSectionValue = policeSectionKnown.has(data.policeContact.section)
    ? data.policeContact.section
    : data.policeContact.section
      ? "other"
      : "";
  const policeSectionOtherValue =
    policeSectionValue === "other"
      ? (data.policeContact.sectionOther ||
          (policeSectionKnown.has(data.policeContact.section) ? "" : data.policeContact.section))
      : "";

  const custodyDurationBaseOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = (i + 1) / 2;
    const label =
      hours === 0.5
        ? "30 minutes"
        : hours === 1
          ? "1 hour"
          : Number.isInteger(hours)
            ? `${hours} hours`
            : `${hours} hours`;
    return { value: `${hours}`, label };
  });
  const custodyDurationOptions = [
    { value: "", label: "Select duration" },
    ...custodyDurationBaseOptions,
    ...(data.custodyDuration &&
    !custodyDurationBaseOptions.some((o) => o.value === data.custodyDuration)
      ? [{ value: data.custodyDuration, label: data.custodyDuration }]
      : []),
  ];

  return (
    <FieldGroup title="A. CALL OUT AND ARRIVAL">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <Input
            label="1. Name of Independent Person"
            value={data.independentPersonName}
            onChange={(e) => updateField("independentPersonName", e.target.value)}
            required
            disabled={readOnly}
          />
          <Input
            label="IP Number"
            value={data.independentPersonNumber || ""}
            onChange={(e) => updateField("independentPersonNumber", e.target.value)}
            disabled={readOnly}
          />
        </div>

        <Input
          label="2. Police station"
          value={data.policeStation}
          onChange={(e) => updateField("policeStation", e.target.value)}
          required
          disabled={readOnly}
        />

        <DateInput
          label="3. Date of interview (DD/MM/YY)"
          value={data.interviewDate}
          onChange={(e) => updateField("interviewDate", e.target.value)}
          required
          disabled={readOnly}
        />

        <TimeInput
          label="4. Time of call from call centre operator"
          value={data.callTime}
          onChange={(e) => updateField("callTime", e.target.value)}
          required
          disabled={readOnly}
        />

        <FieldGroup title="5. Police contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Input
              label="Rank"
              value={data.policeContact.rank}
              onChange={(e) =>
                updateField("policeContact", { ...data.policeContact, rank: e.target.value })
              }
              required
              disabled={readOnly}
            />
            <Input
              label="Name"
              value={data.policeContact.name}
              onChange={(e) =>
                updateField("policeContact", { ...data.policeContact, name: e.target.value })
              }
              required
              disabled={readOnly}
            />
            <div className="space-y-2">
              <Select
                label="Section"
                value={policeSectionValue}
                onChange={(e) => {
                  const next = e.target.value;
                  updateField("policeContact", {
                    ...data.policeContact,
                    section: next,
                    sectionOther:
                      next === "other"
                        ? policeSectionOtherValue || data.policeContact.sectionOther || ""
                        : "",
                  });
                }}
                options={policeSectionOptions}
                required
                disabled={readOnly}
              />
              {policeSectionValue === "other" && (
                <Input
                  placeholder="Please specify"
                  value={policeSectionOtherValue}
                  onChange={(e) =>
                    updateField("policeContact", {
                      ...data.policeContact,
                      section: "other",
                      sectionOther: e.target.value,
                    })
                  }
                  disabled={readOnly}
                />
              )}
            </div>
          </div>
        </FieldGroup>

        <TimeInput
          label="6. Time you arrived at the police station"
          value={data.arrivalTime}
          onChange={(e) => updateField("arrivalTime", e.target.value)}
          required
          disabled={readOnly}
        />

        <div>
          <RadioGroup
            name="parentNotAttendingReason"
            label="7. Reason for parent or guardian not attending"
            options={parentNotAttendingOptions.map(opt => ({
              value: opt.value,
              label: opt.label.replace(", specify", "")
            }))}
            value={data.parentNotAttendingReason?.[0] || ""}
            onChange={(value) => {
              updateField("parentNotAttendingReason", [value]);
              if (value !== "other") {
                updateField("parentNotAttendingOther", undefined);
              }
            }}
            disabled={readOnly}
          />
          {data.parentNotAttendingReason?.[0] === "other" && (
            <div className="mt-2">
              <Input
                placeholder="Please specify"
                value={data.parentNotAttendingOther || ""}
                onChange={(e) => updateField("parentNotAttendingOther", e.target.value)}
                disabled={readOnly}
              />
            </div>
          )}
        </div>

        <Select
          label="8. How long has the YP been in custody?"
          value={data.custodyDuration}
          onChange={(e) => updateField("custodyDuration", e.target.value)}
          options={custodyDurationOptions}
          required
          disabled={readOnly}
        />

        <FieldGroup title="9. What are the main types of offences that the YP is being interviewed about?">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Crimes against the person:</label>
              <CheckboxGroup
                options={crimesAgainstPersonOptions}
                selectedValues={data.mainOffenceTypes.crimesAgainstPerson}
                onSelectionChange={(values) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    crimesAgainstPerson: values,
                  })
                }
                otherValues={
                  data.mainOffenceTypes.crimesAgainstPersonOther
                    ? { other: data.mainOffenceTypes.crimesAgainstPersonOther }
                    : {}
                }
                onOtherValueChange={(_, value) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    crimesAgainstPersonOther: value,
                  })
                }
                columns={1}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Drugs:</label>
              <CheckboxGroup
                options={drugsOptions}
                selectedValues={data.mainOffenceTypes.drugs}
                onSelectionChange={(values) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    drugs: values,
                  })
                }
                otherValues={
                  data.mainOffenceTypes.drugsOther
                    ? { other: data.mainOffenceTypes.drugsOther }
                    : {}
                }
                onOtherValueChange={(_, value) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    drugsOther: value,
                  })
                }
                columns={1}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Crimes against the property:</label>
              <CheckboxGroup
                options={crimesAgainstPropertyOptions}
                selectedValues={data.mainOffenceTypes.crimesAgainstProperty}
                onSelectionChange={(values) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    crimesAgainstProperty: values,
                  })
                }
                otherValues={
                  data.mainOffenceTypes.crimesAgainstPropertyOther
                    ? { other: data.mainOffenceTypes.crimesAgainstPropertyOther }
                    : {}
                }
                onOtherValueChange={(_, value) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    crimesAgainstPropertyOther: value,
                  })
                }
                columns={1}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Other:</label>
              <CheckboxGroup
                options={otherOffencesOptions}
                selectedValues={data.mainOffenceTypes.other}
                onSelectionChange={(values) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    other: values,
                  })
                }
                otherValues={
                  data.mainOffenceTypes.otherOther ? { other: data.mainOffenceTypes.otherOther } : {}
                }
                onOtherValueChange={(_, value) =>
                  updateField("mainOffenceTypes", {
                    ...data.mainOffenceTypes,
                    otherOther: value,
                  })
                }
                columns={1}
              />
            </div>
          </div>
        </FieldGroup>

        <RadioGroup
          name="offenceOccurredInDHHS"
          label="10. Did the offence occur in DHHS residential unit?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.offenceOccurredInDHHS}
          onChange={(value) => updateField("offenceOccurredInDHHS", value as "yes" | "no" | "")}
          error={!data.offenceOccurredInDHHS ? "This field is required" : undefined}
          disabled={readOnly}
        />
      </div>
    </FieldGroup>
  );
};
