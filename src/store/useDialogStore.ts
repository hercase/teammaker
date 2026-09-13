import { DialogOptions, DialogStore } from "@/types";
import { create } from "zustand";

export const useDialogStore = create<DialogStore>((set) => ({
  options: null,
  open: (options: DialogOptions) => set({ options }),
  close: () => set({ options: null }),
}));
