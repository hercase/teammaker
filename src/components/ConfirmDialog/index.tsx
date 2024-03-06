"use client";

import useDialogStore from "@/store/useDialogStore";
import { XMarkIcon } from "@heroicons/react/20/solid";

const ConfirmDialog = () => {
  const { open, state, handleClose, handleSubmit } = useDialogStore();

  if (!open) return null;

  return (
    <div
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen w-screen"
    >
      <div className="relative p-8 text-center bg-white rounded-lg shadow">
        <button
          type="button"
          className="text-gray-400 absolute top-1 right-1 bg-transparent text-sm p-1.5 ml-auto inline-flex items-center"
        >
          <XMarkIcon className="h-5 w-5" />
          <span className="sr-only">Close modal</span>
        </button>

        <p className="mb-4 text-gray-500">{state.title}</p>
        <div className="flex justify-center items-center space-x-4">
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
      </div>
    </div>
  );
};

export default ConfirmDialog;
