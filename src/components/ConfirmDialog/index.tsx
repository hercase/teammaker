"use client";

import { FC, useEffect, useState } from "react";
import { AlertDialog, Input, Label, TextField } from "@heroui/react";
import Button from "@/components/Button";
import { useDialogStore } from "@/store";

/*
  The app's only confirm dialog. It lives in the layout and is opened from anywhere through
  useAlert, so every confirmation in the app is the same object.

  HeroUI's AlertDialog rather than a hand-built one: focus trapping, the backdrop, scroll locking and
  Escape are its problem now. isDismissable stays off — dropping a player is a decision, and a stray
  tap on the backdrop should not answer it either way.
*/
const ConfirmDialog: FC = () => {
  const { options, close } = useDialogStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (options) {
      setValue("");
      setError(undefined);
    }
  }, [options]);

  const confirm = () => {
    const message = options?.input ? options.inputValidator?.(value) : undefined;

    if (message) return setError(message);

    options?.onConfirm(value);
    close();
  };

  return (
    <AlertDialog isOpen={Boolean(options)} onOpenChange={(open) => !open && close()}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-full max-w-sm">
            <AlertDialog.Header>
              <AlertDialog.Heading>{options?.text}</AlertDialog.Heading>
            </AlertDialog.Header>

            {options?.input && (
              <AlertDialog.Body className="flex flex-col gap-3">
                {/*
                  The waiting list, one tap each: the most common answer to "who comes in" is the
                  next name on it, and typing a name on a phone is the slow way to say so. A tap
                  fills the box rather than confirming, so a slip of the thumb costs nothing.
                */}
                {options.choices && options.choices.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Suplentes">
                    {options.choices.map((choice) => (
                      <Button
                        key={choice}
                        variant={value === choice ? "primary" : "ghost"}
                        onClick={() => {
                          setValue(choice);
                          setError(undefined);
                        }}
                      >
                        {choice}
                      </Button>
                    ))}
                    {/* "Nobody" is an answer too, and it should not have to be typed. */}
                    {options.emptyLabel && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          options.onConfirm("");
                          close();
                        }}
                      >
                        {options.emptyLabel}
                      </Button>
                    )}
                  </div>
                )}

                <TextField
                  aria-label={options.text}
                  isInvalid={Boolean(error)}
                  value={value}
                  onChange={setValue}
                  autoFocus
                >
                  <Label className="sr-only">{options.text}</Label>
                  {/* data-testid, not id: HeroUI generates the input's id for the label to point at. */}
                  <Input data-testid="dialog-input" onKeyDown={(event) => event.key === "Enter" && confirm()} />
                  {error && (
                    <p role="alert" className="mt-2 text-sm text-error-400">
                      {error}
                    </p>
                  )}
                </TextField>
              </AlertDialog.Body>
            )}

            <AlertDialog.Footer className="flex gap-3">
              <Button className="flex-1" onClick={confirm}>
                Confirmar
              </Button>
              <Button variant="ghost" className="flex-1" onClick={close}>
                Cancelar
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};

export default ConfirmDialog;
