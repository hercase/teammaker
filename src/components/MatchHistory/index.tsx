import React from "react";
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import PlayerName from "@/components/PlayerName";
import { format } from "date-fns";
import usePlayers from "@/hooks/usePlayers";

const MatchHistory = () => {
  const { history, players, substitutes } = usePlayers();

  if (!history.length) return null;

  return (
    <ul
      className="flex flex-col justify-between bg-white dark:bg-gray-800
    rounded-md p-2"
    >
      {history.map(({ player_id, type, date }) => {
        const player = players.find((p) => p.id === player_id);

        const substitute = substitutes.find((p) => p.id === player?.isReplacedBy);

        if (!player) return null;

        return (
          <li key={format(date, "HH:mm:ss") + player} className="flex gap-1 items-center text-gray-600  text-xs">
            <span className="text-gray-400">{format(date, "dd/MM HH:mm")}</span>

            <span className="flex items-center text-red-600 capitalize">
              <ArrowDownCircleIcon className="w-5 h-5 fill-red-600 " />
              <PlayerName player={player} className="!text-red-600 p-0 w-auto" />
            </span>

            <span className="text-gray-600 dark:text-gray-400">
              {type === "substitute" ? "reemplazado por" : "se dio de baja."}
            </span>
            {type === "substitute" && substitute && (
              <>
                <span className="flex items-center">
                  <ArrowUpCircleIcon className="w-5 h-5 fill-green-600" />
                  <PlayerName player={substitute} className="!text-green-600 p-0 w-auto" />
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
