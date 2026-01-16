"use client";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { YRIPPFormData } from "@/lib/types/yripp-form";

interface InterviewSectionProps {
  data: YRIPPFormData["interview"];
  onChange: (data: YRIPPFormData["interview"]) => void;
  readOnly?: boolean;
}

export const InterviewSection = ({ data, onChange, readOnly = false }: InterviewSectionProps) => {
  const updateField = <K extends keyof YRIPPFormData["interview"]>(
    field: K,
    value: YRIPPFormData["interview"][K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FieldGroup title="Interview">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">30. Interviewing officers.</label>
          <FieldGroup title="Informant">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Rank:"
                value={data.informant.rank}
                onChange={(e) =>
                  updateField("informant", { ...data.informant, rank: e.target.value })
                }
                disabled={readOnly}
              />
              <Input
                label="Name:"
                value={data.informant.name}
                onChange={(e) => updateField("informant", { ...data.informant, name: e.target.value })}
                disabled={readOnly}
              />
              <Input
                label="Badge Number:"
                value={data.informant.badgeNumber}
                onChange={(e) =>
                  updateField("informant", { ...data.informant, badgeNumber: e.target.value })
                }
                disabled={readOnly}
              />
            </div>
          </FieldGroup>
          <FieldGroup title="Corroborator">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Rank:"
                value={data.corroborator.rank}
                onChange={(e) =>
                  updateField("corroborator", { ...data.corroborator, rank: e.target.value })
                }
                disabled={readOnly}
              />
              <Input
                label="Name:"
                value={data.corroborator.name}
                onChange={(e) =>
                  updateField("corroborator", { ...data.corroborator, name: e.target.value })
                }
                disabled={readOnly}
              />
              <Input
                label="Badge Number:"
                value={data.corroborator.badgeNumber}
                onChange={(e) =>
                  updateField("corroborator", { ...data.corroborator, badgeNumber: e.target.value })
                }
                disabled={readOnly}
              />
            </div>
          </FieldGroup>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">31. Interview times</label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                commenced (or recommenced with IP present)
              </label>
              <Input
                type="time"
                value={data.interviewTimes.commenced}
                onChange={(e) =>
                  updateField("interviewTimes", {
                    ...data.interviewTimes,
                    commenced: e.target.value,
                  })
                }
                className="w-auto"
                disabled={readOnly}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm font-medium whitespace-nowrap">suspended</label>
              <Input
                type="time"
                value={data.interviewTimes.suspended}
                onChange={(e) =>
                  updateField("interviewTimes", {
                    ...data.interviewTimes,
                    suspended: e.target.value,
                  })
                }
                className="w-auto"
                disabled={readOnly}
              />
              <label className="text-sm font-medium whitespace-nowrap">recommenced</label>
              <Input
                type="time"
                value={data.interviewTimes.recommenced}
                onChange={(e) =>
                  updateField("interviewTimes", {
                    ...data.interviewTimes,
                    recommenced: e.target.value,
                  })
                }
                className="w-auto"
                disabled={readOnly}
              />
            </div>
            {(data.interviewTimes.suspended || data.interviewTimes.recommenced) && (
              <TextArea
                label="If the interview was suspended, what was the reason?"
                value={data.interviewTimes.reasonForSuspension}
                onChange={(e) =>
                  updateField("interviewTimes", {
                    ...data.interviewTimes,
                    reasonForSuspension: e.target.value,
                  })
                }
                rows={2}
                disabled={readOnly}
              />
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">concluded</label>
              <Input
                type="time"
                value={data.interviewTimes.concluded}
                onChange={(e) =>
                  updateField("interviewTimes", {
                    ...data.interviewTimes,
                    concluded: e.target.value,
                  })
                }
                className="w-auto"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            32. Did you witness any of the following? And were the following done with or without the YP&apos;s consent?
          </label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left"></th>
                  <th className="border border-gray-300 p-2 text-center">yes</th>
                  <th className="border border-gray-300 p-2 text-center">no</th>
                  <th className="border border-gray-300 p-2 text-center">
                    didn&apos;t witness but told it happened
                  </th>
                  <th className="border border-gray-300 p-2 text-center">consent</th>
                  <th className="border border-gray-300 p-2 text-center">without consent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "fingerprinting", label: "fingerprinting" },
                  { key: "photographing", label: "photographing" },
                  { key: "searching", label: "searching" },
                  { key: "dna", label: "DNA" },
                ].map(({ key, label }) => {
                  const action = data.witnessedActions.find((a) => a.action === key) || {
                    action: key as any,
                    witnessed: "no" as const,
                    consent: "withoutConsent" as const,
                  };
                  const index = data.witnessedActions.findIndex((a) => a.action === key);
                  return (
                    <tr key={key}>
                      <td className="border border-gray-300 p-2 font-medium">{label}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={action.witnessed === "yes"}
                          disabled={readOnly}
                          onChange={(e) => {
                            const updated = [...data.witnessedActions];
                            if (index >= 0) {
                              updated[index] = {
                                ...action,
                                witnessed: e.target.checked ? ("yes" as const) : ("no" as const),
                              };
                            } else {
                              updated.push({
                                ...action,
                                witnessed: "yes" as const,
                              });
                            }
                            updateField("witnessedActions", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={action.witnessed === "no"}
                          disabled={readOnly}
                          onChange={(e) => {
                            const updated = [...data.witnessedActions];
                            if (index >= 0) {
                              updated[index] = {
                                ...action,
                                witnessed: e.target.checked ? ("no" as const) : ("yes" as const),
                              };
                            } else {
                              updated.push({
                                ...action,
                                witnessed: "no" as const,
                              });
                            }
                            updateField("witnessedActions", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={action.witnessed === "didntWitnessButTold"}
                          disabled={readOnly}
                          onChange={(e) => {
                            const updated = [...data.witnessedActions];
                            if (index >= 0) {
                              updated[index] = {
                                ...action,
                                witnessed: e.target.checked
                                  ? ("didntWitnessButTold" as const)
                                  : ("no" as const),
                              };
                            } else {
                              updated.push({
                                ...action,
                                witnessed: "didntWitnessButTold" as const,
                              });
                            }
                            updateField("witnessedActions", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={action.consent === "consent"}
                          disabled={readOnly}
                          onChange={(e) => {
                            const updated = [...data.witnessedActions];
                            if (index >= 0) {
                              updated[index] = {
                                ...action,
                                consent: e.target.checked ? ("consent" as const) : ("withoutConsent" as const),
                              };
                            } else {
                              updated.push({
                                ...action,
                                consent: "consent" as const,
                              });
                            }
                            updateField("witnessedActions", updated);
                          }}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={action.consent === "withoutConsent"}
                          disabled={readOnly}
                          onChange={(e) => {
                            const updated = [...data.witnessedActions];
                            if (index >= 0) {
                              updated[index] = {
                                ...action,
                                consent: e.target.checked
                                  ? ("withoutConsent" as const)
                                  : ("consent" as const),
                              };
                            } else {
                              updated.push({
                                ...action,
                                consent: "withoutConsent" as const,
                              });
                            }
                            updateField("witnessedActions", updated);
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
        </div>
      </div>
    </FieldGroup>
  );
};
