"use client";

import { FC, useMemo } from "react";
import { UseFormRegister } from "react-hook-form";
import { FieldError, Label, TextArea, TextField } from "@heroui/react";
import { ClipboardIcon } from "@heroicons/react/20/solid";
import Button from "@/components/Button";
import { MatchInputs } from "@/types";
import { countPlayers } from "@/utils";
import { placeholderList } from "@/utils/placeholder";

interface ListInputProps {
  error: boolean;
  submitted: boolean;
  value?: string;
  // The Pegar button: the text has to be written into the box as well as read.
  onPaste: (clipText: string) => void;
  // A paste made by hand, with the keyboard or the phone's own menu: the box fills itself, the
  // form only gets to read what arrived.
  onPasted?: (clipText: string) => void;
  register: UseFormRegister<MatchInputs>;
}

const ListInput: FC<ListInputProps> = ({ register, error, submitted, value, onPaste, onPasted, ...rest }) => {
  const isEmpty = !value?.trim();

  /*
    Six names off the group's own roster, a fresh six every time the form is opened, so the example
    never reads as the app having favourites. Memoised because the box re-renders on every keystroke
    and the deal has no business being recomputed while someone is typing over it: once per mount,
    then it holds. The form only mounts once the stores have rehydrated, so this never renders on
    the server and cannot mismatch on hydration.
  */
  const placeholder = useMemo(() => placeholderList(), []);

  /*
    validationBehavior="aria", not the default "native": react-hook-form owns the rules here, and with
  native validation the browser refuses the submit on its own before react-hook-form ever runs — so
  no error was recorded, nothing turned red, and the button looked broken.

  An empty box is not a mistake, it is the starting point: tabbing through it must not turn it red
    or accuse you of anything. It becomes wrong only once you have actually tried to create the
    teams, and then it is wrong the same way the empty name and the empty date are — a red field, no
    sentence. It used to answer "Pegá la lista para empezar", which repeated the placeholder already
    sitting in the box, in grey, while every other field had gone red.

    A list that is too short is the one case worth a sentence: the box has something in it, so
    nothing about it looks unfinished, and the reason is not on screen anywhere.
  */
  const isTooShort = error && !isEmpty;
  const isMissing = error && isEmpty && submitted;

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      if (clipText) onPaste(clipText);
    });

  return (
    <TextField
      className="flex w-full flex-1 flex-col gap-2"
      /* React Aria owns what the box shows; without this, the Pegar button filled the form and
         left the box empty. See the note in TextInput. */
      value={value ?? ""}
      isInvalid={isTooShort || isMissing}
      validationBehavior="aria"
    >
      <Label className="sr-only">Lista de jugadores</Label>

      {/* The paste listener sits on the wrapper: React Aria decides which DOM props reach its
          textarea, and the event bubbles here regardless. */}
      <div
        className="relative flex flex-1 flex-col"
        onPaste={(event) => onPasted?.(event.clipboardData.getData("text"))}
      >
        <TextArea
          rows={8}
          /*
            336px on a phone: at 14px over a 22.75px line that is exactly fourteen names, which is
            a full Tuesday list visible without scrolling the box. It used to be 256px, which held
            ten — so a normal list was always cut off while you were checking it against WhatsApp.
            md:min-h-0 hands the height back to the flex column on a desktop, where the box already
            stretches to the form.
          */
          className="h-auto min-h-84 flex-1 resize-none font-mono text-sm leading-relaxed md:min-h-0"
          placeholder={placeholder}
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
          aria-label="Pegar lista desde el portapapeles"
          className="absolute bottom-3 right-3 p-3"
          onClick={() => handlePaste()}
        >
          <ClipboardIcon className="size-5" />
        </Button>
      </div>

      {isTooShort && <FieldError>Necesitás al menos 4 jugadores para armar los equipos.</FieldError>}
    </TextField>
  );
};

export default ListInput;
