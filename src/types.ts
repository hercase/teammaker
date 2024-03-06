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
  new: Player["id"];
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
  resetMatch: () => void;
}
