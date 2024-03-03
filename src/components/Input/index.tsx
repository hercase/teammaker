import { forwardRef } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";

interface InputProps {
  label: string;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error = false, ...props }, ref) => (
  <div className="label flex flex-col gap-1">
    <label htmlFor={label}>{label}</label>
    <div className="relative">
      <input
        ref={ref}
        id={label}
        className={classNames("input border-0 outline-none", {
          "text-red-600 ring-1 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
            error,
        })}
        {...props}
      />
      {error && (
        <div className="pointer-events-none absolute right-0 top-0 h-full flex items-center pr-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
        </div>
      )}
    </div>
  </div>
));

Input.displayName = "Input";

export default Input;
