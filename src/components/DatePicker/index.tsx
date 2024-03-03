import classNames from "classnames";
import { forwardRef } from "react";

interface DatePickerProps {
  error?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({ error = false, ...props }, ref) => (
  <div className="w-full text-sm text-gray-400">
    <span className="label">Fecha</span>
    <input
      ref={ref}
      type="datetime-local"
      className={classNames("input border-0 outline-none", {
        "text-red-600 ring-1 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
          error,
      })}
      {...props}
    />
  </div>
));

DatePicker.displayName = "DatePicker";

export default DatePicker;
