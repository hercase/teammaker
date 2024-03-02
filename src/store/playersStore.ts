import create from "zustand-store-addons";
import { Player } from "@/types";
import { generatePlayers } from "@/helpers";

interface PlayersState {
  input: string;
  setInput: (input: string) => void;
  players: Player[] | [];
}

export const playersStore = create<PlayersState>(
  (set) => ({
    input: "",
    setInput: (input: string) => set(() => ({ input })),
    players: [],
  }),
  {
    computed: {
      players: function () {
        return generatePlayers(this.input);
      },
    },
  }
);
