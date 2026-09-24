"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import usePlayers from "@/hooks/usePlayers";
import Spinner from "@/components/Spinner";
import CreateMatchForm from "@/components/CreateMatchForm";

const Create = () => {
  const router = useRouter();
  const { hasHydrated, players } = usePlayers();

  useEffect(() => {
    if (hasHydrated && players?.length) {
      router.push("/match");
    }
  }, [hasHydrated, players, router]);

  if (!hasHydrated) return <Spinner />;

  return <CreateMatchForm />;
};

export default Create;
