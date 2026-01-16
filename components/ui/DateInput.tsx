import { InputHTMLAttributes } from "react";
import { Input } from "./Input";

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const DateInput = ({ label, error, className = "", ...props }: DateInputProps) => {
  return (
    <Input
      type="date"
      label={label}
      error={error}
      className={className}
      {...props}
    />
  );
};
