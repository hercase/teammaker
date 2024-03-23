import InfoCard from "@/components/InfoCard";
import { getMatch } from "@/sanity/queries";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Match({ params }: PageProps) {
  const match = await getMatch(params.id);
  const { date, location, organizer, players, random } = match;

  if (!match) {
    return <div>Match not found</div>;
  }

  return (
    <div>
      <InfoCard
        date={new Date(date)}
        location={location}
        organizer={organizer.nickname}
        playersLength={players.length}
        random={random}
      />
    </div>
  );
}

export const revalidate = 300; // 5 minutes
