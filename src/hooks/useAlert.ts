import { useCallback } from "react";
import { useDialogStore } from "@/store";

interface AlertOptions {
  text: string;
  input?: "text";
  inputValidator?: (value: string) => string | undefined;
  cb: (value: string) => void;
}

/*
  Same call signature the sweetalert2 version had, so every caller stayed untouched. What changed
  is that the dialog is now a React component using the app's own tokens, instead of a library
  rendering outside React with a second design system written into customClass strings.

  Memoised because callers put it in effect dependency arrays. A fresh arrow function on every
  render made the "el partido ya finalizó" effect fire on every render, so dismissing that dialog
  and touching anything at all brought it straight back.
*/
const useAlert = () => {
  const open = useDialogStore((state) => state.open);

  return useCallback(
    ({ text, input, inputValidator, cb }: AlertOptions) =>
      open({ text, input: input === "text", inputValidator, onConfirm: cb }),
    [open]
  );
};

export default useAlert;
