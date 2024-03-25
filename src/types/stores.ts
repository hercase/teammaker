import { Colors, MatchFields, MatchInputs, Person, Player, PlayersFields } from "@/types";

export type MatchStore = MatchFields & {
  setColors: (colors: Colors) => void;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
};

export type PlayersStore = PlayersFields & {
  hasHydrated: boolean;
  renamePlayer: (id: string, player_name: string) => void;
  setHasHydrated: (state: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setBench: (bench: Player[]) => void;
  removePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  resetMatch: () => void;
  exchangePlayers: (playerId1: string, playerId2: string) => void;
};

export interface UIStore {
  profile: Person | null;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export interface ProfileStore {
  profile: Person | null;
  setProfile: (profile: Person) => void;
}
