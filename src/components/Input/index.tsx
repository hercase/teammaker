import { forwardRef } from "react";
import classNames from "classnames";

interface InputProps {
  label: string;
  type?: string;
  error?: boolean;
  variant?: "outline";
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error = false, variant, labelClassName, type, ...props }, ref) => (
    <div className="label flex flex-col gap-2">
      <label
        className={classNames(labelClassName, {
          "text-red-500": error,
        })}
        htmlFor={label}
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={label}
          type={type}
          className={classNames("input border-1 outline-none", {
            "text-red-600 ring-2 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
              error,
            "border border-primary-300": variant === "outline",
          })}
          {...props}
        />
      </div>
    </div>
  )
);

Input.displayName = "Input";

export default Input;
