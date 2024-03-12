import { ReactNode } from "react";

export type Player = {
  id: string;
  name: string;
  details?: string;
  isDeleted?: boolean;
  isReplacedBy?: Player["id"];
};

export type Colors = {
  teamA?: string;
  teamB?: string;
};

export type MatchEvent = {
  type: "substitute" | "delete";
  player_id: Player["id"];
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
export interface MatchState {
  players: Player[];
  substitutes: Player[];
  history: MatchEvent[];
  location: string;
  date: Date | null;
  organizer: string;
  random: boolean;
  colors: Colors;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setColors: (colors: Colors) => void;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
  setPlayers: (players: Player[]) => void;
  setSubstitutes: (substitutes: Player[]) => void;
  removePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  resetMatch: () => void;
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
