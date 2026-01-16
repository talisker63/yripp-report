"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface SectionBPartBProps {
  data: YRIPPFormData["sectionBPartB"];
  onChange: (data: YRIPPFormData["sectionBPartB"]) => void;
}

export const SectionBPartB = ({ data, onChange }: SectionBPartBProps) => {
  const updateField = <K extends keyof YRIPPFormData["sectionBPartB"]>(
    field: K,
    value: YRIPPFormData["sectionBPartB"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const hasWorkerOptions = [
    { value: "no", label: "no, does not currently have a worker" },
    { value: "childProtection", label: "yes, from Child Protection (DHHS)" },
    { value: "youthJustice", label: "yes, from Youth Justice (DHHS)" },
    { value: "disabilityServices", label: "yes, from Disability Services" },
    { value: "unsure", label: "yes, has worker but unsure of agency" },
    { value: "otherAgency", label: "yes, from another agency (eg Resi Unit)" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  const referralServiceTypes = [
    { key: "legalService", label: "legal service" },
    { key: "housing", label: "housing" },
    { key: "counselling", label: "counselling" },
    { key: "healthService", label: "health service" },
    { key: "drugAlcohol", label: "drug & alcohol service" },
    { key: "indigenous", label: "Indigenous/Aboriginal" },
    { key: "migrantRefugee", label: "migrant and refugee" },
    { key: "genericYouth", label: "generic youth service" },
    { key: "educationEmployment", label: "education/employment" },
    { key: "schoolTeacher", label: "school teacher" },
    { key: "disability", label: "disability service" },
    { key: "other", label: "other" },
  ];

  const ypWantsActionOptions = [
    { value: "seekLegalAdvice", label: "seek legal advice" },
    { value: "raiseWithSergeant", label: "raise with Sergeant now" },
    { value: "formalComplaint", label: "formal complaint later" },
    { value: "noAction", label: "no action now" },
    { value: "other", label: "other, specify", hasOther: true },
  ];

  return (
    <FieldGroup
      title="D. YOUNG PERSON'S INFORMATION (PART B)"
      description="Information that the young person has provided to YRIPP in confidence should be noted in this section of the Interview Report."
    >
      <div className="space-y-6">
        <FieldGroup title="Referral Information">
          <div className="space-y-4">
            <div>
              <CheckboxGroup
                label="38. Does the YP have a &apos;worker&apos;?"
                options={hasWorkerOptions}
                selectedValues={data.hasWorker}
                onSelectionChange={(values) => updateField("hasWorker", values)}
                otherValues={data.hasWorkerOther ? { other: data.hasWorkerOther } : {}}
                onOtherValueChange={(_, value) => updateField("hasWorkerOther", value)}
                columns={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                39. Did you refer the YP to support services?
              </label>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left"></th>
                      <th className="border border-gray-300 p-2 text-center">Faxed Referral</th>
                      <th className="border border-gray-300 p-2 text-center">Card Referral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralServiceTypes.map(({ key, label }) => {
                      const service =
                        data.referralServices[key as keyof typeof data.referralServices] ||
                        ({ faxed: false, card: false } as any);
                      const isOther = key === "other";
                      const otherService = isOther ? (service as { faxed: boolean; card: boolean; specify?: string }) : null;
                      return (
                        <tr key={key}>
                          <td className="border border-gray-300 p-2 font-medium">
                            {isOther && (service.faxed || service.card) && otherService ? (
                              <div>
                                <div>{label}</div>
                                <input
                                  type="text"
                                  placeholder="Specify"
                                  value={otherService.specify || ""}
                                  onChange={(e) => {
                                    const updated = {
                                      ...data.referralServices,
                                      [key]: { ...otherService, specify: e.target.value },
                                    };
                                    updateField("referralServices", updated);
                                  }}
                                  className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            ) : (
                              label
                            )}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={service.faxed}
                              onChange={(e) => {
                                const updated = {
                                  ...data.referralServices,
                                  [key]: { ...service, faxed: e.target.checked },
                                };
                                updateField("referralServices", updated);
                              }}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={service.card}
                              onChange={(e) => {
                                const updated = {
                                  ...data.referralServices,
                                  [key]: { ...service, card: e.target.checked },
                                };
                                updateField("referralServices", updated);
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
              <Input
                label="Name of services you referred the YP to?"
                value={data.referralServicesNames || ""}
                onChange={(e) => updateField("referralServicesNames", e.target.value)}
                className="mt-4"
              />
            </div>

            <Input
              label="40. If YP did not want a referral, what were the reasons?"
              value={data.referralNotWantedReason || ""}
              onChange={(e) => updateField("referralNotWantedReason", e.target.value)}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Young Person's Contact Details*">
          <div className="space-y-4">
            <RadioGroup
              name="permissionToRecordContact"
              label="Has YP given permission to YRIPP to record their contact details so YRIPP can follow them up if required?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={data.permissionToRecordContact}
              onChange={(value) =>
                updateField("permissionToRecordContact", value as "yes" | "no" | "")
              }
            />

            {data.permissionToRecordContact === "yes" && (
              <div className="space-y-4">
                <Input
                  label="Full Name:"
                  value={data.contactDetails?.fullName || ""}
                  onChange={(e) =>
                    updateField("contactDetails", {
                      ...data.contactDetails,
                      fullName: e.target.value,
                      addressLine1: data.contactDetails?.addressLine1 || "",
                      addressLine2: data.contactDetails?.addressLine2 || "",
                      phone: data.contactDetails?.phone || "",
                      contactThroughOther: data.contactDetails?.contactThroughOther || {
                        name: "",
                        relationship: "",
                        phone: "",
                      },
                    })
                  }
                />
                <Input
                  label="Address:"
                  value={data.contactDetails?.addressLine1 || ""}
                  onChange={(e) =>
                    updateField("contactDetails", {
                      ...data.contactDetails,
                      addressLine1: e.target.value,
                      fullName: data.contactDetails?.fullName || "",
                      addressLine2: data.contactDetails?.addressLine2 || "",
                      phone: data.contactDetails?.phone || "",
                      contactThroughOther: data.contactDetails?.contactThroughOther || {
                        name: "",
                        relationship: "",
                        phone: "",
                      },
                    })
                  }
                />
                <Input
                  value={data.contactDetails?.addressLine2 || ""}
                  onChange={(e) =>
                    updateField("contactDetails", {
                      ...data.contactDetails,
                      addressLine2: e.target.value,
                      fullName: data.contactDetails?.fullName || "",
                      addressLine1: data.contactDetails?.addressLine1 || "",
                      phone: data.contactDetails?.phone || "",
                      contactThroughOther: data.contactDetails?.contactThroughOther || {
                        name: "",
                        relationship: "",
                        phone: "",
                      },
                    })
                  }
                />
                <Input
                  label="Phone:"
                  type="tel"
                  value={data.contactDetails?.phone || ""}
                  onChange={(e) =>
                    updateField("contactDetails", {
                      ...data.contactDetails,
                      phone: e.target.value,
                      fullName: data.contactDetails?.fullName || "",
                      addressLine1: data.contactDetails?.addressLine1 || "",
                      addressLine2: data.contactDetails?.addressLine2 || "",
                      contactThroughOther: data.contactDetails?.contactThroughOther || {
                        name: "",
                        relationship: "",
                        phone: "",
                      },
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact through another trusted person: include name, relationship, contact phone number.
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Name"
                      value={data.contactDetails?.contactThroughOther?.name || ""}
                      onChange={(e) =>
                        updateField("contactDetails", {
                          ...data.contactDetails,
                          contactThroughOther: {
                            ...(data.contactDetails?.contactThroughOther || {
                              name: "",
                              relationship: "",
                              phone: "",
                            }),
                            name: e.target.value,
                          },
                          fullName: data.contactDetails?.fullName || "",
                          addressLine1: data.contactDetails?.addressLine1 || "",
                          addressLine2: data.contactDetails?.addressLine2 || "",
                          phone: data.contactDetails?.phone || "",
                        })
                      }
                    />
                    <Input
                      label="Relationship"
                      value={data.contactDetails?.contactThroughOther?.relationship || ""}
                      onChange={(e) =>
                        updateField("contactDetails", {
                          ...data.contactDetails,
                          contactThroughOther: {
                            ...(data.contactDetails?.contactThroughOther || {
                              name: "",
                              relationship: "",
                              phone: "",
                            }),
                            relationship: e.target.value,
                          },
                          fullName: data.contactDetails?.fullName || "",
                          addressLine1: data.contactDetails?.addressLine1 || "",
                          addressLine2: data.contactDetails?.addressLine2 || "",
                          phone: data.contactDetails?.phone || "",
                        })
                      }
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={data.contactDetails?.contactThroughOther?.phone || ""}
                      onChange={(e) =>
                        updateField("contactDetails", {
                          ...data.contactDetails,
                          contactThroughOther: {
                            ...(data.contactDetails?.contactThroughOther || {
                              name: "",
                              relationship: "",
                              phone: "",
                            }),
                            phone: e.target.value,
                          },
                          fullName: data.contactDetails?.fullName || "",
                          addressLine1: data.contactDetails?.addressLine1 || "",
                          addressLine2: data.contactDetails?.addressLine2 || "",
                          phone: data.contactDetails?.phone || "",
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </FieldGroup>

        <FieldGroup title="After Interview">
          <div className="space-y-4">
            <RadioGroup
              name="happyWithTreatment"
              label="41. Was the YP happy with their treatment by police and with the interview process?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={data.happyWithTreatment}
              onChange={(value) => updateField("happyWithTreatment", value as "yes" | "no" | "")}
            />

            {data.happyWithTreatment === "no" && (
              <div className="space-y-4">
                <TextArea
                  label="If 'No', provide details of the YP's concerns if not noted elsewhere on this Interview Report."
                  value={data.treatmentConcerns || ""}
                  onChange={(e) => updateField("treatmentConcerns", e.target.value)}
                  rows={4}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What does YP want to do about their concerns?
                  </label>
                  <CheckboxGroup
                    options={ypWantsActionOptions}
                    selectedValues={data.ypWantsAction}
                    onSelectionChange={(values) => updateField("ypWantsAction", values)}
                    otherValues={data.ypWantsActionOther ? { other: data.ypWantsActionOther } : {}}
                    onOtherValueChange={(_, value) => updateField("ypWantsActionOther", value)}
                    columns={1}
                  />
                </div>
              </div>
            )}
          </div>
        </FieldGroup>
      </div>
    </FieldGroup>
  );
};
