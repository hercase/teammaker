"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";

const ConfirmDialog = () => {
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

        <p className="mb-4 text-gray-500">Are you sure you want to delete this item?</p>
        <div className="flex justify-center items-center space-x-4">
          <button
            type="submit"
            className="py-2 px-3 text-sm font-medium text-center text-white bg-primary-900 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300"
          >
            Confirm
          </button>
          <button
            type="button"
            className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
