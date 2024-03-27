import CreateMatchForm from "@/components/CreateMatchForm";
import { getProfile } from "@/services/person";

const Create = async () => {
  const profile = await getProfile();

  return <CreateMatchForm organizer={profile} />;
};

export default Create;
