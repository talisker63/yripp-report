"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface IPConcernsSectionProps {
  data: YRIPPFormData["ipConcerns"];
  onChange: (data: YRIPPFormData["ipConcerns"]) => void;
}

export const IPConcernsSection = ({ data, onChange }: IPConcernsSectionProps) => {
  const updateField = <K extends keyof YRIPPFormData["ipConcerns"]>(
    field: K,
    value: YRIPPFormData["ipConcerns"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const concernAboutOptions = [
    { value: "police", label: "police" },
    { value: "bailJustice", label: "bail justice" },
    { value: "cahabps", label: "CAHABPS/DHS" },
    { value: "yp", label: "YP" },
    { value: "pso", label: "Protective Services Officer (PSO)" },
    { value: "vals", label: "Victorian Aboriginal Legal Service (VALS)" },
    { value: "vla", label: "Victoria Legal Aid (VLA)" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  return (
    <FieldGroup title="IP'S Concerns">
      <div className="space-y-6">
        <RadioGroup
          name="hasConcerns"
          label="37. From what you have witnessed, do you have any concerns about the treatment of the YP, the process or the YP's welfare?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={data.hasConcerns}
          onChange={(value) => updateField("hasConcerns", value as "yes" | "no" | "")}
        />

        {data.hasConcerns === "yes" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">If &apos;Yes&apos;, what are your concerns about?</label>
              <CheckboxGroup
                options={concernAboutOptions}
                selectedValues={data.concernAbout}
                onSelectionChange={(values) => updateField("concernAbout", values)}
                otherValues={data.concernAboutOther ? { other: data.concernAboutOther } : {}}
                onOtherValueChange={(_, value) => updateField("concernAboutOther", value)}
                columns={1}
              />
            </div>

            <Input
              label="If your concerns are about the conduct of a particular person, what is that person's name?"
              value={data.personName || ""}
              onChange={(e) => updateField("personName", e.target.value)}
            />

            <TextArea
              label="What action did you or others take, if any?"
              value={data.actionTaken || ""}
              onChange={(e) => updateField("actionTaken", e.target.value)}
              rows={5}
            />
          </div>
        )}
      </div>
    </FieldGroup>
  );
};
