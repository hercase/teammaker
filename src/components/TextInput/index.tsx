"use client";

import { FC } from "react";
import classNames from "classnames";
import { UseFormRegister } from "react-hook-form";
import { Input, InputGroup, Label, TextField } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { MatchInputs } from "@/types";

interface TextInputProps {
  label: string;
  name: keyof MatchInputs;
  error?: boolean;
  placeholder?: string;
  value?: string;
  onClear?: () => void;
  register: UseFormRegister<MatchInputs>;
  // The price is the one field that is optional and numeric; everything else is required text.
  // inputMode brings up the number keyboard on a phone; the type stays "text" because a number
  // input draws spinner arrows nobody wants and reports an empty box as 0.
  inputMode?: "text" | "numeric";
  required?: boolean;
  valueAs?: (value: string) => unknown;
  // Text drawn inside the box before what is typed — "$" on the price — via HeroUI's InputGroup.
  prefix?: string;
}

/*
  HeroUI's TextField for the label, the invalid state and the wiring between them; react-hook-form
  still owns the value.

  The registration goes on the inner Input rather than on TextField: TextField's own onChange hands
  back a string, which react-hook-form's register cannot consume, but the Input underneath takes the
  ref and the events exactly as before. No Controller, and no call site changes.

  validationBehavior="aria", not the default "native": react-hook-form owns the rules here, and with
  native validation the browser refuses the submit on its own before react-hook-form ever runs — so
  no error was recorded, nothing turned red, and the button looked broken.

  value, not defaultValue — and it is the whole reason this component takes a value at all. React
  Aria holds the input's value in its own state and writes it back into the DOM on every render,
  while react-hook-form's setValue assigns node.value directly and fires no event. So anything the
  app set from code was erased on the next render: the X left the old name in the box, pasting a
  list left the box empty, and the edit dialog opened with three blank fields. Handing React Aria
  the form's value on every render puts the two back in agreement — register still takes the events
  and the ref from the input underneath, so typing is unchanged. Defaulted to "" so the field is
  controlled from the first render and never switches modes.
*/
const TextInput: FC<TextInputProps> = ({
  label,
  name,
  error = false,
  value,
  onClear,
  register,
  required = true,
  valueAs,
  prefix,
  ...rest
}) => (
  /* isRequired draws HeroUI's asterisk on the label; with validationBehavior="aria" that is all it
     does, react-hook-form still decides what is missing. */
  <TextField
    className="flex w-full flex-col gap-2"
    value={value ?? ""}
    isInvalid={error}
    isRequired={required}
    validationBehavior="aria"
  >
    <Label htmlFor={name}>{label}</Label>

    <div className="relative">
      {prefix ? (
        /* InputGroup rather than a "$" drawn over the box: it is the library's own way of putting
           text inside a field, and it takes the field's states with it. */
        <InputGroup className="min-h-11 w-full">
          <InputGroup.Prefix>{prefix}</InputGroup.Prefix>
          <InputGroup.Input
            id={name}
            type="text"
            className="w-full"
            {...register(name, { required, setValueAs: valueAs })}
            {...rest}
          />
        </InputGroup>
      ) : (
        /* w-full because HeroUI's Input sizes to its content, and the clear button is positioned
           against this wrapper — without it the X sat outside the field. */
        <Input
          id={name}
          type="text"
          className={classNames("min-h-11 w-full", { "pr-11": onClear && value })}
          {...register(name, { required, setValueAs: valueAs })}
          {...rest}
        />
      )}

      {/*
        These two fields come back filled from the last match, which is what makes the weekly use of
        this form quick. Clearing one has to be quicker than selecting text on a phone.
      */}
      {onClear && value && (
        <button
          type="button"
          aria-label={`Borrar ${label.toLowerCase()}`}
          onClick={onClear}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-text-subtle transition-colors hover:text-text"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  </TextField>
);

TextInput.displayName = "TextInput";

export default TextInput;
