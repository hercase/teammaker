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
      organizer->{nickname},
      players,
      random,
      colors  
    }`,
    { id }
  );
}
