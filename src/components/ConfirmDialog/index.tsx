"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

import useDialogStore from "@/store/useDialogStore";

const ConfirmDialog = () => {
  const { open, state, handleClose, handleSubmit } = useDialogStore();

  if (!open) return null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-4 text-gray-900">
                  {state.title}
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{state.description}</p>
                </div>

                <div className="flex justify-center items-center space-x-4 mt-4">
                  <button
                    type="submit"
                    className="py-2 px-3 text-sm font-medium text-center text-white bg-primary-900 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300"
                    onClick={handleSubmit}
                  >
                    {state.submitText}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
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
