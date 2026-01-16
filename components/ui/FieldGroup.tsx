import { ReactNode } from "react";

interface FieldGroupProps {
  title?: string;
  description?: string | ReactNode;
  children: ReactNode;
  className?: string;
}

export const FieldGroup = ({
  title,
  description,
  children,
  className = "",
}: FieldGroupProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-bold">{title}</h3>
          {description && (
            <div className="text-sm text-gray-600 mt-1">{description}</div>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};
