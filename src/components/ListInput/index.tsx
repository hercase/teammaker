import { FC } from "react";
import { UseFormRegister } from "react-hook-form";
import classNames from "classnames";
import Button from "@/components/Button";
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { MatchInputs } from "@/types";

interface ListInputProps {
  error: boolean;
  onPaste: (clipText: string) => void;
  register: UseFormRegister<MatchInputs>;
}

const ListInput: FC<ListInputProps> = ({ register, error, onPaste, ...rest }) => {
  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      if (clipText) onPaste(clipText);
    });

  return (
    <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
      <textarea
        className={classNames("p-4 w-full flex-1 rounded-md resize-none outline-hidden input", {
          "text-error-600 ring-1 ring-inset ring-error-600 placeholder:text-error-300 focus:ring-2 focus:ring-inset focus:ring-error-500":
            error,
        })}
        placeholder={`1. Pedro\n2. Flor\n3. Juan \n4. Sylvie\n5. Chloe ...`}
        {...register("list", {
          required: true,
          validate: (value: string) => value.split("\n").filter((v) => v).length > 3,
        })}
        {...rest}
      />
      <Button type="button" variant="secondary" className="absolute bottom-5 right-5" onClick={() => handlePaste()}>
        <ClipboardDocumentIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ListInput;
