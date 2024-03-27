import { baseUrl } from "@/env";
import { Person, SanityFields } from "@/types";
import { getServerSession } from "next-auth";

export const getProfile = async (): Promise<Person & SanityFields> => {
  const session = await getServerSession();
  const email = session?.user?.email as string;
  const person = await fetch(`${baseUrl}/api/person?email=${email}`, { method: "GET" });
  return person.json();
};

export const createPerson = async (person: Person): Promise<Person> => {
  const response = await fetch(`${baseUrl}/api/person`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });

  return response.json();
};
