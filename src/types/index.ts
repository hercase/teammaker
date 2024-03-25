import { ReactNode } from "react";

export type Person = {
  name: string;
  nickname: string;
  email: string;
  phone: string;
};

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
  type: "replace" | "delete" | "rename";
  old_name: string;
  new_name?: string;
  date: Date;
};

export interface PlayersFields {
  players: Player[];
  bench: Player[];
  history: MatchEvent[];
}
export interface MatchFields {
  location: string;
  date: Date | null;
  organizer: Person;
  random: boolean;
  colors?: Colors;
}

export type MatchType = MatchFields & PlayersFields;

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

export interface SanityFields {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}
