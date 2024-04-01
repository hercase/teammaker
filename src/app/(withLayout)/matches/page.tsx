import { getMatchesByOrganizer } from "@/services/match";
import { getProfile } from "@/services/person";
import Link from "next/link";

export default async function Matches() {
  const profile = await getProfile();
  const matches = await getMatchesByOrganizer(profile._id);

  return (
    <div className="m-4 px-4  w-full">
      <ul role="list" className="divide-y divide-gray-100 bg-white shadow sm:rounded-md px-4 ">
        {matches?.map((match) => (
          <Link key={match._id} href={`/match/${match._id}`}>
            <li key={match._id} className="flex items-center justify-between gap-x-6 py-5">
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{match.location}</p>
                  {match.random && (
                    <p className="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-gray-600 bg-gray-50 ring-gray-500/10">
                      Aleatorio
                    </p>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                  <p className="whitespace-nowrap">
                    <time dateTime={match.date}>{match.date}</time>
                  </p>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p>{match.maxPlayers} jugadores</p>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export const revalidate = 300; // 5 minutes
