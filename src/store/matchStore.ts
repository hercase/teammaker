import { Team } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MatchState {
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

export const matchStore = create(
  persist<MatchState>(
    (set) => ({
      location: "",
      setLocation: (location: string) => set(() => ({ location })),
      date: new Date(),
      setDate: (date: Date) => set(() => ({ date })),
      creator: "",
      setCreator: (creator: string) => set(() => ({ creator })),
      random: false,
      setRandom: (random: boolean) => set(() => ({ random })),
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
