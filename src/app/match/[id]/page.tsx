import MatchCard from "@/components/MatchCard";
import { getMatch } from "@/sanity/queries";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Match({ params }: PageProps) {
  const match = await getMatch(params.id);
  const { date, location, organizer, players, random, bench, colors, history } = match;

  if (!match) {
    return <div>Match not found</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <MatchCard
        players={players}
        bench={bench}
        date={date}
        location={location}
        organizer={organizer.nickname}
        random={random}
        colors={colors}
        history={history}
      />
    </div>
  );
}

export const revalidate = 300; // 5 minutes
