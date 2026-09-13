import { FC } from "react";
import { useMatchStore } from "@/store";
import usePlayers from "@/hooks/usePlayers";
import { BIB_HEX } from "@/utils/kit";
import BibIcon from "@/components/Icons/BibIcon";
import InfoCard from "@/components/InfoCard";
import MatchHistory from "@/components/MatchHistory";
import PlayersList from "@/components/PlayersList";

/*
  The match as it is read: where and when, the two teams, who wears what, and what has happened
  since. Its own component because it is rendered twice — once on the screen and once, off-screen
  and at a fixed width, for the picture that gets shared — and those two must never drift apart.
*/
const MatchSummary: FC = () => {
  const { kit } = useMatchStore();
  const { teamA, teamB } = usePlayers();

  return (
    <div className="flex flex-col gap-5">
      <InfoCard />

      <div className="relative flex min-h-[100px] min-w-0 justify-center gap-2 text-center sm:gap-3">
        <PlayersList side="A" kit={kit} players={teamA} />
        <PlayersList side="B" kit={kit} players={teamB} />
      </div>

      {/* One line instead of a label in each header: only one team wears anything. */}
      {kit.mode === "bibs" && (
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text-muted">
          <BibIcon size={18} aria-hidden="true" color={BIB_HEX} />
          El equipo {kit.bibTeam} juega con pecheras
        </p>
      )}

      <MatchHistory />
    </div>
  );
};

export default MatchSummary;
