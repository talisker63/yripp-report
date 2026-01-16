import { ReactNode } from "react";
import { Checkbox } from "./Checkbox";

interface CheckboxOption {
  value: string;
  label: string;
  hasOther?: boolean;
  otherPlaceholder?: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  otherValues?: Record<string, string>;
  onOtherValueChange?: (optionValue: string, otherValue: string) => void;
  error?: string;
  label?: string;
  columns?: 1 | 2 | 3;
}

export const CheckboxGroup = ({
  options,
  selectedValues,
  onSelectionChange,
  otherValues = {},
  onOtherValueChange,
  error,
  label,
  columns = 1,
}: CheckboxGroupProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
  };

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, optionValue]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== optionValue));
      if (onOtherValueChange && options.find((o) => o.value === optionValue)?.hasOther) {
        onOtherValueChange(optionValue, "");
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map((option) => (
          <div key={option.value} className="space-y-2">
            <Checkbox
              label={option.label}
              checked={selectedValues.includes(option.value)}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxChange(option.value, e.target.checked);
              }}
            />
            {option.hasOther &&
              selectedValues.includes(option.value) && (
                <input
                  type="text"
                  placeholder={option.otherPlaceholder || "Specify"}
                  value={otherValues[option.value] || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    onOtherValueChange?.(option.value, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-6 w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
