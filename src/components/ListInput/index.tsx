import { FC } from "react";
import { UseFormRegister } from "react-hook-form";
import classNames from "classnames";
import Button from "@/components/Button";
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { MatchInputs } from "@/types";
import { countPlayers } from "@/utils";

interface ListInputProps {
  error: boolean;
  submitted: boolean;
  value?: string;
  onPaste: (clipText: string) => void;
  register: UseFormRegister<MatchInputs>;
}

const ListInput: FC<ListInputProps> = ({ register, error, submitted, value, onPaste, ...rest }) => {
  const isEmpty = !value?.trim();

  /*
    An empty box is not a mistake, it is the starting point: tabbing through it must not turn it
    red or accuse you of anything. Only a list that is too short is wrong, and an empty box only
    gets a word once you have actually tried to create the teams.
  */
  const isTooShort = error && !isEmpty;
  const showMessage = isTooShort || (error && submitted);

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      if (clipText) onPaste(clipText);
    });

  return (
    <div className="flex w-full flex-1 flex-col gap-2">
      <div className="relative flex flex-1 flex-col">
        <textarea
          rows={8}
          className={classNames(
            "input h-auto min-h-64 flex-1 resize-y py-3 font-mono text-sm leading-relaxed md:min-h-0",
            {
              "border-error-500 text-error-300": isTooShort,
            }
          )}
          placeholder={"1. Lucho\n2. Mura\n3. Mauro\n4. Lihue\n5. Eze ..."}
          {...register("list", {
            required: true,
            /*
              Counted the way the teams are actually built, not by non-blank lines. A list padded
              with emoji, times or bare numbers used to pass this and then produce no players, so
              the button did nothing and said nothing.
            */
            validate: (list: string) => countPlayers(list) > 3,
          })}
          {...rest}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Pegar lista desde el portapapeles"
          className="absolute bottom-3 right-3"
          onClick={() => handlePaste()}
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
        </Button>
      </div>

      {showMessage && (
        <p role="alert" className={classNames("text-sm", isTooShort ? "text-error-400" : "text-text-muted")}>
          {isTooShort ? "Necesitás al menos 4 jugadores para armar los equipos." : "Pegá la lista para empezar."}
        </p>
      )}
    </div>
  );
};

export default ListInput;
