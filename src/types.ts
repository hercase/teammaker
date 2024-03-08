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

export type Replace = {
  old: Player["id"];
  new?: Player["id"];
};

export interface MatchInputs {
  list: string;
  location: string;
  organizer: string;
  date: Date;
  random: boolean;
  colors?: Colors;
}
export interface MatchState {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  players: Player[];
  substitutes: Player[];
  replacements: Replace[];
  location: string;
  date: Date;
  organizer: string;
  random: boolean;
  colors: Colors;
  setColors: (colors: Colors) => void;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
  setPlayers: (players: Player[]) => void;
  setSubstitutes: (substitutes: Player[]) => void;
  replacePlayer: (old_id: string, new_id?: string) => void;
  resetMatch: () => void;
}

export interface UIStore {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export interface AlertOptions {
  catchOnCancel?: boolean;
  title: string | ReactNode;
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
