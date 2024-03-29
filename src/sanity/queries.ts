import { groq } from "next-sanity";
// Person
export const GET_PERSON_BY_EMAIL = groq`*[_type == "person" && email == $email][0]`;
export const GET_PERSON_BY_ID = groq`*[_type == "person" && _id == $id][0]`;
export const GET_PERSONS = groq`*[_type == "person"]`;

// Match
export const GET_MATCH_BY_ID = groq`*[_type == "match" && _id == $id][0]`;
export const GET_MATCHES = groq`*[_type == "match"]`;
export const GET_MATCHES_BY_ORGANIZER = groq`*[_type == "match" && organizer._ref == $organizerId]{
  _id,
  date,
  location,
  random,
  maxPlayers
}`;
