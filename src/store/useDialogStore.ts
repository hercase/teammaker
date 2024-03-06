import { create } from "zustand";
import { produce } from "immer";

import { DialogStore } from "@/types";

const useDialogStore = create<DialogStore>((set) => ({
  awaitingPromise: {},
  open: false,
  state: {
    title: "Title",
    submitText: "Confirmar",
    catchOnCancel: false,
  },
  dialog: (options) => {
    set(
      produce((state: DialogStore) => {
        state.open = true;
        state.state = { ...state.state, ...options };
      })
    );
    return new Promise<void>((resolve, reject) => {
      set(
        produce((state: DialogStore) => {
          state.awaitingPromise = { resolve, reject };
        })
      );
    });
  },
  handleClose: () => {
    set(
      produce((state: DialogStore) => {
        state.state.catchOnCancel && state.awaitingPromise?.reject?.();
        state.open = false;
      })
    );
  },
  handleSubmit: () => {
    set(
      produce((state: DialogStore) => {
        state.awaitingPromise?.resolve?.();
        state.open = false;
      })
    );
  },
}));

export default useDialogStore;
