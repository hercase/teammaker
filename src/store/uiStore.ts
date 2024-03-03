import { create } from "zustand";

interface UIStore {
  showEditPlayerModal: boolean;
  setShowEditPlayerModal: (show: boolean) => void;
}

export const uiStore = create<UIStore>((set) => ({
  showEditPlayerModal: false,
  setShowEditPlayerModal: (show: boolean) => set(() => ({ showEditPlayerModal: show })),
}));
