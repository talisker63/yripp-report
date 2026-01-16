import { InputHTMLAttributes } from "react";
import { Input } from "./Input";

interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const TimeInput = ({ label, error, className = "", ...props }: TimeInputProps) => {
  return (
    <Input
      type="time"
      label={label}
      error={error}
      className={className}
      {...props}
    />
  );
};
