import MatchCard from "@/components/MatchCard";
import { getMatch } from "@/services/match";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Match({ params }: PageProps) {
  const match = await getMatch(params.id);

  if (!match) {
    redirect("/");
    r;
  }

  return (
    <div className="flex flex-col w-full">
      <MatchCard
        players={match.players}
        bench={match.bench}
        date={match.date}
        location={match.location}
        organizer={match.organizer}
        random={match.random}
        colors={match.colors}
        history={match.history}
      />
    </div>
  );
}

export const revalidate = 300; // 5 minutes
