import Button from "@/components/Button";
import MatchListItem from "@/components/MatchListItem/indext";
import { getMatchesByOrganizer } from "@/services/match";
import { getProfile } from "@/services/person";
import { isBefore, isAfter } from "date-fns";
import { sortBy } from "lodash";
import Link from "next/link";

const Divider = ({ label }: { label: string }) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center left-24" aria-hidden="true">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-start">
      <span className=" pr-3 text-base font-semibold leading-6 text-gray-100">{label}</span>
    </div>
  </div>
);

export default async function Matches() {
  const profile = await getProfile();
  const matches = await getMatchesByOrganizer(profile._id);

  const sortedMatches = sortBy(matches, (match) => new Date(match.date));
  const futureMatches = sortedMatches?.filter((match) => isAfter(new Date(match.date), new Date()));
  const pastMatches = sortedMatches?.filter((match) => isBefore(new Date(match.date), new Date()));

  return (
    <div className="m-4 px-4 w-full">
      <div className="pb-5 sm:flex sm:items-center sm:justify-between mb-4">
        <h3 className="text-base font-semibold leading-6 text-gray-100">Mis partidos</h3>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <Button small variant="secondary">
            <Link href="/">Crear nuevo</Link>
          </Button>
        </div>
      </div>

      {matches?.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-base font-semibold text-gray-100">No tienes partidos creados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          <Divider label="Próximos" />

          <ul role="list" className="flex flex-col gap-y-2">
            {futureMatches?.map((match) => <MatchListItem key={match._id} match={match} />)}
          </ul>

          {pastMatches?.length !== 0 && (
            <>
              <Divider label="Pasados" />

              <ul role="list" className="flex flex-col gap-y-2 opacity-80">
                {pastMatches?.map((match) => <MatchListItem key={match._id} match={match} />)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const revalidate = 300; // 5 minutes
