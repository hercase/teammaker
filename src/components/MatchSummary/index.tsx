import { FC } from "react";
import { useMatchStore } from "@/store";
import usePlayers from "@/hooks/usePlayers";
import { UserMinusIcon, UsersIcon } from "@heroicons/react/20/solid";
import { countPlaying, generateFullName } from "@/utils";
import { BIB_HEX, kitLabel } from "@/utils/kit";
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
  const { kit, capacity } = useMatchStore();
  const { teamA, teamB, substitutes } = usePlayers();

  /*
    After a drop-out the sides are 6 against 5 and the only thing saying so is a small number in
    each header. This is the thing the group has to act on before kick-off, so it is said in words
    where the picture is read — the same line and the same voice as the bibs.
  */
  const playingA = countPlaying(teamA);
  const playingB = countPlaying(teamB);
  const short = playingA === playingB ? null : playingA < playingB ? ("A" as const) : ("B" as const);
  const missing = Math.abs(playingA - playingB);
  /*
    The cap, when the sides are even and still under it: "Faltan 2 para completar el cupo de 12".
    When one side is short the line above already says where the hole is, so this one stays quiet.
  */
  const belowCap = capacity && !short ? capacity - playingA - playingB : 0;

  return (
    <div className="flex flex-col gap-5">
      <InfoCard />

      <div className="relative flex min-h-[100px] min-w-0 justify-center gap-2 text-center sm:gap-3">
        <PlayersList side="A" kit={kit} players={teamA} />
        <PlayersList side="B" kit={kit} players={teamB} />
      </div>

      {short && (
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text-muted">
          <UserMinusIcon className="h-[18px] w-[18px] shrink-0 text-error-400" aria-hidden="true" />
          {missing === 1 ? "Falta uno" : `Faltan ${missing}`} en {kitLabel(kit, short)}
        </p>
      )}

      {belowCap > 0 && (
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text-muted">
          <UserMinusIcon className="h-[18px] w-[18px] shrink-0 text-error-400" aria-hidden="true" />
          {belowCap === 1 ? "Falta uno" : `Faltan ${belowCap}`} para completar el cupo de {capacity}
        </p>
      )}

      {/* One line instead of a label in each header: only one team wears anything. */}
      {kit.mode === "bibs" && (
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-text-muted">
          <BibIcon size={18} aria-hidden="true" color={BIB_HEX} />
          El equipo {kit.bibTeam} juega con pecheras
        </p>
      )}

      {/* Who is next in line: the group reads it off the picture before anyone asks. */}
      {substitutes.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-text-muted">
          <UsersIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium text-text">Suplentes:</span>{" "}
            <span className="capitalize">{substitutes.map((sub) => generateFullName(sub).trim()).join(", ")}</span>
          </span>
        </p>
      )}

      <MatchHistory />
    </div>
  );
};

export default MatchSummary;
