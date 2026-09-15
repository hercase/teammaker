export type TeamSide = "A" | "B";

export type Player = {
  id: string;
  name: string;
  details?: string;
  isDeleted?: boolean;
  isReplacedBy?: Player["id"];
  /*
    Which side this row is on, written down. It used to be derived from where the row sat in the
    list — the first ceil(n/2) rows were team A — and that cannot represent a B bigger than A, so
    every Sumar jugador that should have grown the smaller side silently stole a player from the
    other one instead. Optional only because a Player is also minted for a rename event and for
    the bench, where no side applies; every row in players carries one.
  */
  team?: TeamSide;
};

export type PresetColor = "white" | "black" | "celeste" | "blue" | "red" | "green" | "yellow";

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
  type: "replace" | "delete" | "rename" | "restore" | "join" | "shuffle";
  /*
    Who the event is about. Optional because a shuffle is the one thing that happens to the match
    rather than to a person: "se mezclaron los equipos" names nobody, and inventing a name for it
    would put a arrow and a colour next to something that neither arrived nor left.
  */
  old_name?: string;
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
  // How many play. Names past it are substitutes, and the picture says how many are still missing.
  capacity: number | null;
}
export interface MatchStore {
  location: string;
  date: string | Date | null;
  organizer: string;
  /*
    Whether *these* teams were drawn at random. A fact about the match that already happened, which
    is why the card states it to the group and why dragging is off while it holds.
  */
  random: boolean;
  /*
    How this group builds teams, remembered for the next list. Separate from `random` because
    Mezclar sets the fact mid-match, and one Tuesday's rescue has no business deciding how the
    following Tuesday's form opens. Every other sticky field is the same value in both roles; this
    is the only one where they came apart.
  */
  prefersRandom: boolean;
  kit: Kit;
  price: number | null;
  capacity: number | null;
  remember: (
    fields: Partial<Pick<MatchStore, "organizer" | "location" | "kit" | "prefersRandom" | "price" | "capacity">>
  ) => void;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
  // These teams were drawn: what Mezclar says about the match without touching what is remembered.
  markAsDrawn: () => void;
}

export interface PlayersStore {
  players: Player[];
  // Who came in for someone: referenced by isReplacedBy, drawn in the replaced player's row.
  bench: Player[];
  // Who is waiting for a spot: the names past the cap, and whoever the message listed as suplentes.
  substitutes: Player[];
  history: MatchEvent[];
  hasHydrated: boolean;
  renamePlayer: (id: string, player_name: string) => void;
  setHasHydrated: (state: boolean) => void;
  setPlayers: (players: Player[]) => void;
  // A match from scratch: these players, these substitutes, and nothing left over from the last one.
  startMatch: (players: Player[], substitutes: Player[]) => void;
  setBench: (bench: Player[]) => void;
  setSubstitutes: (substitutes: Player[]) => void;
  // A substitute takes a player's place: out of the waiting list, into the bench, into the row.
  promoteSubstitute: (old_id: string, substitute_id: string) => void;
  // A new row on one side, for the eleventh player's missing partner: typed, or off the waiting list.
  addPlayer: (player_name: string, side: TeamSide) => void;
  addSubstitute: (substitute_id: string, side: TeamSide) => void;
  removePlayer: (id: string) => void;
  // The undo of removePlayer: the person is back on the team and the history says so.
  restorePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  // Deals the sides again, to whoever is still playing: the way out of a 6v4 nobody can fill.
  shuffleTeams: () => void;
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
  // Names offered beside the input, one tap each: the substitutes, when there are any.
  choices?: string[];
  // A way to answer "nobody": confirms with an empty value, and says what that means.
  emptyLabel?: string;
  inputValidator?: (value: string) => string | undefined;
  onConfirm: (value: string) => void;
}

export interface DialogStore {
  options: DialogOptions | null;
  open: (options: DialogOptions) => void;
  close: () => void;
}
