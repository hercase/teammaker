import { FC } from "react";
import classNames from "classnames";
import { addMinutes, format } from "date-fns";
import { MatchInputs } from "@/types";
import { UseFormRegister } from "react-hook-form";

interface DateInputProps {
  error: boolean;
  variant?: "outline-solid";
  register: UseFormRegister<MatchInputs>;
}

const DateInput: FC<DateInputProps> = ({ register, error, variant, ...rest }) => (
  <div className="label flex flex-col gap-2 w-full">
    <label
      className={classNames({
        "text-error-500": error,
      })}
      htmlFor="date"
    >
      Fecha <span className=" text-xs text-gray-400">(mínimo 15 minutos desde ahora)</span>
    </label>
    <div className="relative">
      <input
        id="date"
        type="datetime-local"
        min={format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm")}
        className={classNames("input border outline-hidden", {
          "text-error-600 ring-2 ring-inset ring-error-600 placeholder:text-error-300 focus:ring-2 focus:ring-inset focus:ring-error-500":
            error,
          "border border-primary-300": variant === "outline-solid",
        })}
        {...register("date", { required: true })}
        {...rest}
      />
    </div>
  </div>
);

DateInput.displayName = "DateInput";

export default DateInput;
