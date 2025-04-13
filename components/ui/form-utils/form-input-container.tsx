import { FC, ReactNode } from "react";

interface FormInputContainerProps {
  inputId: string;
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
}

export const FormInputContainer: FC<FormInputContainerProps> = ({
  inputId,
  label,
  children,
  error,
  required = false,
  description,
  className,
}) => {
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="font-medium text-sm text-neutral-darker" htmlFor={inputId}>
        {label}
        {required && (
          <span className="text-brand-danger ml-1" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {description && (
        <p id={descriptionId} className="text-xs text-neutral-600 -mt-1">
          {description}
        </p>
      )}
      <div aria-describedby={`${descriptionId || ""} ${errorId || ""}`}>{children}</div>
      {error && (
        <div>
          <p id={errorId} className="text-brand-danger text-xs" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
