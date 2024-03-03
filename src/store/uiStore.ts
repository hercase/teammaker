import create from "zustand-store-addons";
import { generatePlayers } from "@/helpers";

interface UIState {
  input: string;
  setInput: (input: string) => void;
  playersCount: number;
}

export const uiStore = create<UIState>(
  (set) => ({
    input: "",
    setInput: (input: string) => set(() => ({ input })),
    playersCount: 0,
  }),
  {
    computed: {
      playersCount: function () {
        return generatePlayers(this.input).length;
      },
    },
  }
);
