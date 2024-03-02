/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { filterPlayers } from "../helpers";
import { Players } from "@/types";

interface MatchState {
  players: string[];
  location: string;
  date: Date;
  creator: string;
  max_players: number;
  random: boolean;
  setLocation: (location: string) => void;
  setPlayers: (players: Players) => void;
  setDate: (date: Date) => void;
  setCreator: (creator: string) => void;
  setMaxPlayers: (max_players: number) => void;
  setRandom: (random: boolean) => void;
}

export const matchStore = create<MatchState>((set) => ({
  players: [],
  location: "",
  date: new Date(),
  creator: "",
  max_players: 12,
  random: false,
  colors: ["#ffffff", "#2C3590"],
  setLocation: (location: string) => set(() => ({ location })),
  setPlayers: (players: Players) => set(() => ({ players })),
  setDate: (date: Date) => set(() => ({ date })),
  setCreator: (creator: string) => set(() => ({ creator })),
  setMaxPlayers: (max_players: number) => set(() => ({ max_players })),
  setRandom: (random: boolean) => set(() => ({ random })),
}));
