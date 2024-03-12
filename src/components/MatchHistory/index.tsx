import React from "react";
import { useMatchStore } from "@/store";
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import PlayerName from "@/components/PlayerName";

const MatchHistory = () => {
  const { players, replacements, substitutes } = useMatchStore();

  if (!replacements.length) return null;

  return (
    <ul className="flex flex-col justify-between bg-white rounded-md p-2">
      {replacements.map((replace) => {
        const player = players.find((p) => p.id === replace.old);
        const sub = substitutes.find((s) => s.id === replace.new);

        return (
          <li key={replace.old} className="flex gap-1 items-center text-gray-600 text-sm">
            {player && (
              <span className="flex items-center text-red-600 capitalize">
                <ArrowDownCircleIcon className="w-5 h-5 fill-red-600 " />
                <PlayerName player={player} className="!text-red-600" />
              </span>
            )}

            <span className="text-gray-600">{sub?.name ? "reemplazado por" : "se dio de baja."}</span>

            {sub && (
              <>
                <span className="flex items-center">
                  <ArrowUpCircleIcon className="w-5 h-5 fill-green-600" />
                  <PlayerName player={sub} className="!text-green-600" />
                  <span>.</span>
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MatchHistory;
