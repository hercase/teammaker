import { getPerson } from "@/services/person";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  const email = session?.user?.email as string;
  const profile = await getPerson(email);

  return {
    status: 200,
    body: profile,
  };
}
