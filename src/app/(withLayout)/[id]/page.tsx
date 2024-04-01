import MatchCard from "@/components/MatchCard";
import { getMatch } from "@/services/match";
import { getPersonById } from "@/services/person";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Match({ params }: PageProps) {
  const match = await getMatch(params.id);
  const organizer = await getPersonById(match.organizer._ref);

  if (!match) {
    redirect("/");
  }

  return (
    <div className="flex flex-col w-full">
      <MatchCard match={match} organizer={organizer} />
    </div>
  );
}

export const revalidate = 300; // 5 minutes
