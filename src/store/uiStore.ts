import { create } from "zustand";

interface UIStore {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export const uiStore = create<UIStore>((set) => ({
  showEditModal: false,
  setShowEditModal: (show: boolean) => set(() => ({ showEditModal: show })),
}));
