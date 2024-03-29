import { create } from "zustand";

type UIStore = {
  isLoading: boolean;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
};

const initialState = {
  isLoading: false,
  showEditModal: false,
};

export const useUiStore = create<UIStore>((set) => ({
  ...initialState,
  setShowEditModal: (show: boolean) => set(() => ({ showEditModal: show })),
  setIsLoading: (loading: boolean) => set(() => ({ isLoading: loading })),
}));
