import { FC } from "react";
import classNames from "classnames";
import { UseFormRegister } from "react-hook-form";
import { MatchInputs } from "@/types";

interface TextInputProps {
  label: string;
  name: keyof MatchInputs;
  error?: boolean;
  variant?: "outline-solid";
  register: UseFormRegister<MatchInputs>;
}

const TextInput: FC<TextInputProps> = ({ label, name, error = false, variant, register, ...rest }) => (
  <div className="label flex flex-col gap-2 w-full">
    <label className={classNames({ "text-red-500": error })} htmlFor={name}>
      {label}
    </label>
    <div className="relative">
      <input
        id={label}
        type="text"
        className={classNames("input border outline-hidden", {
          "text-red-600 ring-2 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
            error,
          "border border-primary-300": variant === "outline-solid",
        })}
        {...register(name, { required: true })}
        {...rest}
      />
    </div>
  </div>
);
TextInput.displayName = "TextInput";

export default TextInput;
