import { baseUrl } from "@/env";
import { MatchFields, SanityFields, SanityReference } from "@/types";

interface Args extends MatchFields {
  organizer: SanityReference;
}

export const createMatch = async (match: Args): Promise<MatchFields & SanityFields> => {
  const response = await fetch(`${baseUrl}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(match),
  });

  return response.json();
};

export const getMatch = async (id: string) => {
  const match = await fetch(`${baseUrl}/api/match?id=${id}`, { method: "GET" });

  if (!match.ok) return null;

  return match.json();
};
interface Match {
  _id: string;
  date: string;
  location: string;
  random: boolean;
  maxPlayers: number;
}

export const getMatchesByOrganizer = async (organizerId: string): Promise<Match[] | null> => {
  const matches = await fetch(`${baseUrl}/api/matches?organizerId=${organizerId}`, { method: "GET" });

  if (!matches.ok) return null;

  return matches.json();
};
