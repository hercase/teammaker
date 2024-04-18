import { create } from "zustand";

type UIStore = {
  isLoading: boolean;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
};

export const useUiStore = create<UIStore>((set) => ({
  isLoading: false,
  showEditModal: false,
  setShowEditModal: (show) => set({ showEditModal: show }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
