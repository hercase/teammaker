import { MatchFields } from "@/types";
import { formatMatchDistance } from "@/utils";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { FC } from "react";

interface MatchListItemProps {
  match: MatchFields & { _id: string };
}

const MatchListItem: FC<MatchListItemProps> = ({ match }) => (
  <Link href={`/match/${match._id}`}>
    <li className="flex items-center justify-between gap-x-6 py-5 px-4 primary-bg rounded-md">
      <div className="min-w-0">
        <div className="flex items-start gap-x-3">
          <p className="text-sm font-semibold leading-6 primary-text">{match.location}</p>
          {match.random && (
            <p className="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-white bg-secondary-600 ring-gray-500/10">
              Aleatorio
            </p>
          )}
        </div>
        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
          {match.date && (
            <p className="whitespace-nowrap first-letter:uppercase">
              <time>{formatMatchDistance(match.date)} hs</time>
            </p>
          )}
          <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
            <circle cx={1} cy={1} r={1} />
          </svg>
          <p>{match.maxPlayers} jugadores</p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        <ChevronRightIcon className="h-6 w-6 flex-none text-gray-400" aria-hidden="true" />
      </div>
    </li>
  </Link>
);

export default MatchListItem;
