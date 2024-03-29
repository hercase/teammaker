"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PlayersList from "@/components/PlayersList";
import InfoCard from "@/components/InfoCard";
import MatchHistory from "@/components/MatchHistory";
import { HandRaisedIcon } from "@heroicons/react/20/solid";
import { MatchType } from "@/types";

interface MatchCardProps extends MatchType {}

const MatchCard = ({ match, organizer }: MatchCardProps) => {
  const { lineup, players, random, colors, history } = match;

  const half = Math.ceil(lineup?.length / 2);

  const teamA = lineup?.slice(0, half).map((id) => players.find((player) => player._id === id));
  const teamB = lineup?.slice(half).map((id) => players.find((player) => player._id === id));

  console.log("🚀 ~ teamB:", teamB);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-5 p-4">
        <InfoCard
          date={match.date}
          location={match.location}
          organizer={organizer}
          playersLength={players.length}
          random={random}
        />

        <div className="relative flex justify-center text-center gap-3 min-h-[100px]">
          <PlayersList shirtPosition="right" players={teamA} color={colors?.teamA} />
          <PlayersList shirtPosition="left" players={teamB} color={colors?.teamB} />
        </div>

        {!random && (
          <div className="flex gap-2 items-center text-gray-300">
            <HandRaisedIcon className="w-5 h-5" />
            <p className="text-sm">Arrastra los jugadores para ordenar o cambiar de equipo.</p>
          </div>
        )}

        <MatchHistory history={history} />
      </div>
    </DndProvider>
  );
};

export default MatchCard;
