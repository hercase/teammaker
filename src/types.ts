import { ReactNode } from "react";

export type Player = {
  id: string;
  name: string;
  details?: string;
};

export type Colors = {
  teamA?: string;
  teamB?: string;
};

export type MatchEvent = {
  type: "substitute" | "delete" | "rename";
  player: Player;
  new_player?: Player;
  date: Date;
};

export interface MatchInputs {
  list: string;
  location: string;
  organizer: string;
  date: Date | null;
  random: boolean;
  colors?: Colors;
}
export interface MatchStore {
  location: string;
  date: Date | null;
  organizer: string;
  random: boolean;
  colors: Colors;
  setColors: (colors: Colors) => void;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
}

export interface PlayersStore {
  players: Player[];
  bench: Player[];
  history: MatchEvent[];
  hasHydrated: boolean;
  renamePlayer: (id: string, player_name: string) => void;
  setHasHydrated: (state: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setBench: (bench: Player[]) => void;
  removePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  resetMatch: () => void;
  exchangePlayers: (playerId1: string, playerId2: string) => void;
}

export interface UIStore {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export interface AlertOptions {
  catchOnCancel?: boolean;
  title: string | ReactNode;
  description: string | ReactNode;
  submitText: ReactNode;
}

export interface DialogStore {
  awaitingPromise: {
    resolve?: () => void;
    reject?: () => void;
  };
  open: boolean;
  state: AlertOptions;
  dialog: (options: Partial<AlertOptions>) => Promise<void>;
  handleClose: () => void;
  handleSubmit: () => void;
}
