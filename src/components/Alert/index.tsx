import { Dialog, Transition } from "@headlessui/react";
import Button from "@/components/Button";
import { AlertOptions } from "@/types";
import { Fragment } from "react";
import classNames from "classnames";

type AlertProps = {
  open: boolean;
  onSubmit: () => void;
  onClose: () => void;
  options: AlertOptions;
};

export default function Alert({ open, onSubmit, onClose, options: { title, submitText } }: AlertProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed inset-0 z-40 overflow-y-auto"
        open={open}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClose={(_) => onClose()}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={classNames(
                "z-auto inline-block w-full px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl",
                "sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              )}
            >
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block ">
                <button
                  type="button"
                  className={classNames(
                    "text-gray-400 bg-white rounded-md hover:text-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                    "disabled:filter disabled:brightness-90 disabled:cursor-wait"
                  )}
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button onClick={onSubmit} className={classNames("!font-medium sm:ml-3 w-full sm:w-auto sm:text-sm")}>
                  {submitText}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="!font-medium mt-3 w-full sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
