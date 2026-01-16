import { InputHTMLAttributes, ReactNode } from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

export const RadioGroup = ({
  name,
  options,
  value,
  onChange,
  error,
  label,
  disabled = false,
}: RadioGroupProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={`${name}-${option.value}`}
              className={`flex items-center gap-2 select-none p-1 rounded ${
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={disabled}
                onChange={(e) => {
                  if (!disabled && onChange) {
                    onChange(e.target.value);
                  }
                }}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium flex-1">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
