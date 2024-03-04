export type Player = {
  id: number;
  name: string;
  details: string;
};

export type Colors = {
  teamA?: string;
  teamB?: string;
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
