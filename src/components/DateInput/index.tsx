"use client";

import { FC } from "react";
import { addMinutes, format } from "date-fns";
import { FieldError, Input, Label, TextField } from "@heroui/react";
import { MatchInputs } from "@/types";
import { UseFormRegister } from "react-hook-form";

interface DateInputProps {
  error: boolean;
  // The form's value, handed to React Aria so it stops overwriting it. See the note in TextInput.
  value?: MatchInputs["date"];
  register: UseFormRegister<MatchInputs>;
  /*
    Creating a match in the past is a typo; editing one that starts in ten minutes is Tuesday. The
    rule belongs to the create form only, so editing can leave the date where it is and still fix
    the location.
  */
  requireFuture?: boolean;
}

/*
  HeroUI's field around a native datetime-local input, rather than its DatePicker.

  The DatePicker is the more complete control, and on a desktop it would be the better one. On a
  phone the native input opens the system date wheel, which is the thing everyone in this group
  already knows how to use and the only one that gets the right keyboard. Trading that for a nicer
  calendar would be a regression where the app is actually used.
*/
const FIELD_FORMAT = "yyyy-MM-dd'T'HH:mm";

/*
  A datetime-local input only accepts its own spelling: hand it a Date and it shows nothing at all.
  The store has held both — a string when it came from this field, a Date from an older save.
*/
const asFieldValue = (value: DateInputProps["value"]): string => {
  if (!value) return "";

  return value instanceof Date ? format(value, FIELD_FORMAT) : value;
};

const DateInput: FC<DateInputProps> = ({ register, error, value, requireFuture = true, ...rest }) => (
  <TextField
    className="flex w-full flex-col gap-2"
    value={asFieldValue(value)}
    isInvalid={error}
    isRequired
    validationBehavior="aria"
  >
    <Label htmlFor="date">Fecha</Label>

    {/* min-h-11 is the app's 44px touch target; HeroUI's own field height is 40. */}
    <Input
      id="date"
      type="datetime-local"
      /* The native control follows the page locale for 24h vs AM/PM. es-AR is 18:30, not 06:30 PM. */
      lang="es-AR"
      className="min-h-11 w-full"
      min={requireFuture ? format(addMinutes(new Date(), 15), FIELD_FORMAT) : undefined}
      {...register("date", {
        required: true,
        // The min attribute already blocks earlier values in the picker; this catches a typed one.
        validate: (value) => !requireFuture || !value || new Date(value) > addMinutes(new Date(), 15),
      })}
      {...rest}
    />

    {error && (
      <FieldError>
        {requireFuture ? "Elegí una fecha y hora al menos 15 minutos después de ahora." : "Elegí una fecha y hora."}
      </FieldError>
    )}
  </TextField>
);

DateInput.displayName = "DateInput";

export default DateInput;
