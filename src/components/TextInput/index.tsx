import { FC } from "react";
import classNames from "classnames";
import { UseFormRegister } from "react-hook-form";
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
}

const TextInput: FC<TextInputProps> = ({ label, name, error = false, value, onClear, register, ...rest }) => (
  <div className="label flex w-full flex-col gap-2">
    <label className={classNames({ "text-error-400": error })} htmlFor={name}>
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        type="text"
        className={classNames("input", {
          "border-error-500 text-error-300 placeholder:text-error-400": error,
          "pr-11": onClear && value,
        })}
        {...register(name, { required: true })}
        {...rest}
      />

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
  </div>
);

TextInput.displayName = "TextInput";

export default TextInput;
