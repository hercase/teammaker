import { groq } from "next-sanity";
import { getClient } from "@/sanity/client";
import { MatchType, SanityFields } from "@/types";

const client = getClient();

export async function getMatch(id: string): Promise<MatchType & SanityFields> {
  return client.fetch(
    groq`*[_type == "match" && _id == $id][0]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      date,
      location,
      organizer->,
      players,
      random,
      colors  
    }`,
    { id }
  );
}

export async function getMatchesByOrganizer(organizerId: string): Promise<(MatchType & SanityFields)[]> {
  return client.fetch(
    groq`*[_type == "match" && organizer._ref == $organizerId]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      date,
      location,
      organizer->,
      players,
      random,
      colors  
    }`,
    { organizerId }
  );
}

export async function createMatch(data: MatchType): Promise<MatchType & SanityFields> {
  return client.create({
    _type: "match",
    ...data,
  });
}

export async function updateMatch(id: string, data: MatchType): Promise<MatchType & SanityFields> {
  return client.patch(id).set(data).commit();
}
