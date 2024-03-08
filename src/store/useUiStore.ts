import { UIStore } from "@/types";
import { create } from "zustand";

export const useUiStore = create<UIStore>((set) => ({
  showEditModal: false,
  setShowEditModal: (show: boolean) => set(() => ({ showEditModal: show })),
}));
