"use client";

import { getPerson } from "@/services/person";
import { useSession } from "next-auth/react";

const useProfile = async () => {
  const { data: session } = useSession();
  const email = session?.user?.email;

  if (!email) return null;

  const profile = await getPerson(email);

  return profile;
};

export default useProfile;
