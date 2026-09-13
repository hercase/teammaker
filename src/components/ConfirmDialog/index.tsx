"use client";

import { FC, Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@/components/Button";
import { useDialogStore } from "@/store";

/*
  The app's only confirm dialog. It lives in the layout and is opened from anywhere through
  useAlert, so every confirmation in the app is the same object, built from the same tokens as
  every other surface.
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

  const transitions = {
    enter: "ease-out duration-200",
    leave: "ease-in duration-150",
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    leaveFrom: "opacity-100 scale-100",
    leaveTo: "opacity-0 scale-95",
  };

  return (
    <Transition appear show={Boolean(options)} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child as={Fragment} {...transitions}>
          <div className="overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} {...transitions}>
              <Dialog.Panel className="modal w-full max-w-sm p-6">
                <Dialog.Title as="p" className="text-base text-text">
                  {options?.text}
                </Dialog.Title>

                {options?.input && (
                  <div className="mt-4">
                    <label className="sr-only" htmlFor="dialog-input">
                      {options.text}
                    </label>
                    <input
                      id="dialog-input"
                      autoFocus
                      className="input"
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && confirm()}
                    />
                    {error && (
                      <p role="alert" className="mt-2 text-sm text-error-400">
                        {error}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button className="flex-1" onClick={confirm}>
                    Confirmar
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={close}>
                    Cancelar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
