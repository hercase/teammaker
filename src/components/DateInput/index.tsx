import { forwardRef } from "react";
import classNames from "classnames";
import { format } from "date-fns";

interface DateInputProps {
  error?: boolean;
  variant?: "outline";
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ error = false, variant, ...props }, ref) => (
  <div className="label flex flex-col gap-2 w-full">
    <label
      className={classNames({
        "text-red-500": error,
      })}
      htmlFor="date"
    >
      Fecha
    </label>
    <div className="relative">
      <input
        ref={ref}
        id="date"
        type="datetime-local"
        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
        className={classNames("input border-1 outline-none", {
          "text-red-600 ring-2 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
            error,
          "border border-primary-300": variant === "outline",
        })}
        {...props}
      />
    </div>
  </div>
));

DateInput.displayName = "DateInput";

export default DateInput;
