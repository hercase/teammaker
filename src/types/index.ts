import { ReactNode } from "react";

export interface SanityFields {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityReference {
  _ref: string;
  _type: string;
}

export type Person = {
  name: string;
  nickname: string;
  image: string;
  email: string;
};

export type Player = {
  _key: string;
  name: string;
  details?: string;
};

export type Colors = {
  teamA?: string;
  teamB?: string;
};

export type MatchEvent = {
  type: "replace" | "delete" | "rename";
  old_name: string;
  new_name?: string;
  date: Date;
};

export interface MatchFields {
  lineup: (Player["_key"] | null)[];
  players: Player[];
  history: MatchEvent[];
  location: string;
  date: Date | null;
  random: boolean;
  colors?: Colors;
  maxPlayers: number;
}

export type MatchInputs = MatchFields & {
  list: string;
};

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
