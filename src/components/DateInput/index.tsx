import { FC } from "react";
import classNames from "classnames";
import { addMinutes, format } from "date-fns";
import { MatchInputs } from "@/types";
import { UseFormRegister } from "react-hook-form";

interface DateInputProps {
  error: boolean;
  register: UseFormRegister<MatchInputs>;
  /*
    Creating a match in the past is a typo; editing one that starts in ten minutes is Tuesday. The
    rule belongs to the create form only, so editing can leave the date where it is and still fix
    the location.
  */
  requireFuture?: boolean;
}

const DateInput: FC<DateInputProps> = ({ register, error, requireFuture = true, ...rest }) => (
  <div className="label flex flex-col gap-2 w-full">
    <label
      className={classNames({
        "text-error-400": error,
      })}
      htmlFor="date"
    >
      Fecha
    </label>
    <div className="relative">
      <input
        id="date"
        type="datetime-local"
        min={requireFuture ? format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm") : undefined}
        className={classNames("input", { "border-error-500 text-error-300": error })}
        {...register("date", {
          required: true,
          // The min attribute already blocks earlier values in the picker; this catches a typed one.
          validate: (value) => !requireFuture || !value || new Date(value) > addMinutes(new Date(), 15),
        })}
        {...rest}
      />
    </div>

    {error && (
      <p role="alert" className="text-sm text-error-400">
        {requireFuture ? "Elegí una fecha y hora al menos 15 minutos después de ahora." : "Elegí una fecha y hora."}
      </p>
    )}
  </div>
);

DateInput.displayName = "DateInput";

export default DateInput;
