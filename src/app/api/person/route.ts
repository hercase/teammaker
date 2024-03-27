import { GET_PERSON } from "@/queries/person";
import { getServerSession } from "next-auth";

import { getClient } from "@/sanity/client";

const client = getClient();

export const GET = async (req: Request) => {
  const session = await getServerSession();
  const email = session?.user?.email as string;
  const profile = await client.fetch(GET_PERSON, { email });

  if (!profile) return Response.error();

  return Response.json(profile);
};
