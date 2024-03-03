import { MatchInputs, Team } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MatchState {
  location: string;
  date: Date;
  creator: string;
  random: boolean;
  setMatch: (match: Omit<MatchInputs, "list">) => void;
  teamA: Team;
  setTeamA: (team: Team) => void;
  teamB: Team;
  setTeamB: (team: Team) => void;
  resetMatch: () => void;
}

export const matchStore = create(
  persist<MatchState>(
    (set) => ({
      location: "",
      date: new Date(),
      creator: "",
      random: false,
      setMatch: (match: Omit<MatchInputs, "list">) => {
        set(() => ({
          location: match.location,
          date: new Date(match.date),
          creator: match.creator,
          random: match.random,
        }));
      },
      teamA: { name: "Equipo claro", color: "#ffffff", players: [] },
      setTeamA: (team: Team) => set(() => ({ teamA: team })),
      teamB: { name: "Equipo oscuro", color: "#151d65", players: [] },
      setTeamB: (team: Team) => set(() => ({ teamB: team })),
      resetMatch: () =>
        set(() => ({
          teamA: { name: "Equipo claro", color: "#ffffff", players: [] },
          teamB: { name: "Equipo oscuro", color: "#151d65", players: [] },
          date: new Date(),
        })),
    }),
    {
      name: "match-store",
    }
  )
);
