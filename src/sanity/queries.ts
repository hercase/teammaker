import { groq } from "next-sanity";
import { getClient } from "@/sanity/client";

const client = getClient();

export async function getMatch(id: string) {
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
