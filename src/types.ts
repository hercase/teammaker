export type Player = {
  id: string;
  name: string;
  details?: string;
  isDeleted?: boolean;
  isReplacedBy?: Player["id"];
};

export type PresetColor = "white" | "black" | "celeste" | "blue" | "red" | "green" | "yellow";

export type TeamSide = "A" | "B";

/*
  A discriminated union rather than a bag of optional fields: shirt colours and bibs are mutually
  exclusive in real life, and having both at once was exactly the ambiguity nobody understood.
*/
export interface ShirtsKit {
  mode: "shirts";
  teamA: PresetColor;
  teamB: PresetColor;
}

export interface BibsKit {
  mode: "bibs";
  bibTeam: TeamSide;
}

/*
  Light against dark, without naming a colour. It is how a pickup game actually sorts itself out
  when nobody has matching shirts: whatever you brought is fine as long as it is on the right side
  of the split, so a pale green, a pink and a yellow all count as claras.
*/
export interface ShadesKit {
  mode: "shades";
  lightTeam: TeamSide;
}

export type Kit = ShirtsKit | BibsKit | ShadesKit;
// The three ways a pickup game tells its sides apart, named once.
export type KitMode = Kit["mode"];

export type MatchEvent = {
  // Optional because matches persisted before this existed have events without one.
  id?: string;
  type: "replace" | "delete" | "rename" | "restore";
  old_name: string;
  new_name?: string;
  date: Date;
};

export interface MatchInputs {
  list: string;
  location: string;
  organizer: string;
  // datetime-local inputs hand back a "yyyy-MM-ddTHH:mm" string, and that is what gets persisted.
  date: string | Date | null;
  random: boolean;
  kit: Kit;
  // What the pitch costs, in pesos, or null when nobody said. The picture divides it by whoever plays.
  price: number | null;
}
export interface MatchStore {
  location: string;
  date: string | Date | null;
  organizer: string;
  random: boolean;
  kit: Kit;
  price: number | null;
  remember: (fields: Partial<Pick<MatchStore, "organizer" | "location" | "kit" | "random" | "price">>) => void;
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
  // The undo of removePlayer: the person is back on the team and the history says so.
  restorePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  resetMatch: () => void;
  exchangePlayers: (playerId1: string, playerId2: string) => void;
}

export interface UIStore {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
}

export interface DialogOptions {
  text: string;
  input?: boolean;
  inputValidator?: (value: string) => string | undefined;
  onConfirm: (value: string) => void;
}

export interface DialogStore {
  options: DialogOptions | null;
  open: (options: DialogOptions) => void;
  close: () => void;
}
