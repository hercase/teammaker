import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  isLoading: boolean;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  random: boolean;
  location: string;
};

const initialState = {
  isLoading: false,
  showEditModal: false,
  random: true,
  location: "",
};

export const useUiStore = create(
  persist<UIStore>(
    (set) => ({
      ...initialState,
      setShowEditModal: (show) => set({ showEditModal: show }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "ui-store" }
  )
);
