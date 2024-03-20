import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";

import classNames from "classnames";
import ShirtIcon from "@/components/Icons/ShirtIcon";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { removePlayer, replacePlayer, renamePlayer } = usePlayers();

  return (
    <div className="relative w-1/2 bg-white rounded-md p-2 dark:bg-gray-800 border-l-4" style={{ borderColor: color }}>
      <div className={classNames("flex justify-start mb-2", { "justify-end": shirtPosition === "right" })}>
        <ShirtIcon color={color} />
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {players?.map((player) => (
          <FloatingMenu
            key={uniqueId(`${player.name}-${player.details}`)}
            className={classNames(
              "relative flex gap-1 font-display text-[16px] capitalize justify-center items-center text-gray-600 w-full group dark:text-gray-400"
            )}
            trigger={
              <>
                {player.isDeleted && !player.isReplacedBy && <span className="w-full p-1 py-2">-</span>}

                {player.isReplacedBy && (
                  <>
                    <ArrowPathIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 fill-secondary-600" />
                  </>
                )}

                {!player.isDeleted && <PlayerName player={player} />}

                <EllipsisVerticalIcon className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
              </>
            }
          >
            <MenuOption
              disabled={player.isDeleted}
              onClick={() => renamePlayer(player)}
              icon={<PencilSquareIcon className="h-5 w-5 fill-secondary-600 dark:fill-secondary-400" />}
              label="Renombrar"
            />
            <MenuOption
              disabled={!!player.isReplacedBy}
              onClick={() => replacePlayer(player)}
              icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800 dark:fill-primary-400" />}
              label="Reemplazar"
            />
            <MenuOption
              disabled={player.isDeleted || !!player.isReplacedBy}
              onClick={() => removePlayer(player)}
              icon={<ArrowDownCircleIcon className="h-5 w-5 fill-red-800 dark:fill-red-400" />}
              label="Dar de baja"
            />
          </FloatingMenu>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;
