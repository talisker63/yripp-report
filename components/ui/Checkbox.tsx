import { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox = ({ label, error, className = "", ...props }: CheckboxProps) => {
  const id = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id={id}
        className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      <label htmlFor={id} className="text-sm font-medium cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
