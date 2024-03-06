import React, { FC } from "react";
import Picker, { registerLocale } from "react-datepicker";
import classNames from "classnames";

import { es } from "date-fns/locale/es";

registerLocale("es", es);

import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date;
  error?: boolean;
  onChange: (date: Date) => void;
  variant?: "outline";
}

const DatePicker: FC<DatePickerProps> = ({ selected, error, variant, onChange }) => (
  <div className="label flex flex-col gap-2 w-full">
    <label className={classNames({ "text-red-500": error })}>Fecha</label>
    <Picker
      className={classNames("w-full p-2 border border-gray-300 rounded-md outline-none input text-gray-800", {
        "text-red-600 ring-2 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
          error,
        "border border-primary-300": variant === "outline",
      })}
      dateFormat="dd/MM/yyyy HH:mm"
      showTimeSelect
      locale="es"
      minDate={new Date()}
      selected={selected && new Date(selected)}
      onChange={onChange}
      withPortal
      portalId="root-portal"
    />
  </div>
);

export default DatePicker;
