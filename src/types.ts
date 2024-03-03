export type Player = {
  name: string;
  details: string;
  replacedBy: {
    name: string;
    details: string;
  };
};

export type Team = {
  color: string;
  players: Player[];
};

export interface MatchState {
  location: string;
  setLocation: (location: string) => void;
  date: Date;
  setDate: (date: Date) => void;
  creator: string;
  setCreator: (creator: string) => void;
  random: boolean;
  setRandom: (random: boolean) => void;
  teamA: Team;
  setTeamA: (team: Team) => void;
  teamB: Team;
  setTeamB: (team: Team) => void;
  resetMatch: () => void;
}

export interface MatchInputs {
  list: string;
  location: string;
  creator: string;
  date: string;
  random: boolean;
}