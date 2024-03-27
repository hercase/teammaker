import { groq } from "next-sanity";
import { getClient } from "@/sanity/client";
import { Person, SanityFields } from "@/types";

const client = getClient();

export async function createPerson(data: Person): Promise<Person & SanityFields> {
  const user = await client.fetch(groq`*[_type == "person" && email == $email][0]`, { email: data.email });

  if (user) return client.patch(user._id).set(data).commit();

  return client.create({ _type: "person", ...data });
}

export const GET_PERSON = groq`*[_type == "person" && email == $email][0]`;
