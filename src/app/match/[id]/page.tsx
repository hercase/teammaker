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
      <MatchCard
        players={match.players}
        bench={match.bench}
        date={match.date}
        location={match.location}
        organizer={organizer}
        random={match.random}
        colors={match.colors}
        history={match.history}
      />
    </div>
  );
}

export const revalidate = 300; // 5 minutes
