import CreateMatchForm from "@/components/CreateMatchForm";
import { getPerson } from "@/queries/person";
import { Person } from "@/types";
import { getServerSession } from "next-auth";

export const getProfile = async () => {
  const session = await getServerSession();
  const email = session?.user?.email as string;
  const profile = await getPerson(email);

  return profile;
};

const Create = async () => {
  const profile = await getProfile();

  return <CreateMatchForm organizer={profile as Person} />;
};

export default Create;
