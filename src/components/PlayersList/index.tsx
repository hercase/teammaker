import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";

import classNames from "classnames";
import ShirtIcon from "@/components/Icons/ShirtIcon";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import {
  ArrowDownCircleIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";
import { getContrastColor } from "@/utils";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { removePlayer, replacePlayer, renamePlayer } = usePlayers();
  const borderColor = getContrastColor(color);

  return (
    <div className="relative w-1/2 bg-white rounded-md p-2  border-l-4" style={{ borderColor }}>
      <div className={classNames("flex justify-start mb-2", { "justify-end": shirtPosition === "right" })}>
        <ShirtIcon color={color} />
      </div>

      <ul className="divide-y divide-gray-200 ">
        {players?.map((player, index) => (
          <FloatingMenu
            key={uniqueId(`${player.name}-${player.details}`)}
            className={classNames(
              "relative flex gap-1 font-display text-[16px] capitalize justify-center items-center text-gray-600 w-full group "
            )}
            trigger={
              <>
                <span
                  className={classNames(
                    "text-xs font-bold text-gray-600 opacity-60 absolute left-2 top-1/2 transform -translate-y-1/2",
                    {
                      "opacity-20": player.isDeleted,
                    }
                  )}
                >
                  {index + 1}.
                </span>
                {player.isDeleted && !player.isReplacedBy && <span className="w-full p-1 py-2">-</span>}

                {!player.isDeleted && <PlayerName player={player} />}

                <EllipsisVerticalIcon className="h-5 w-5 absolute right-1 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
              </>
            }
          >
            <MenuOption
              disabled={player.isDeleted}
              onClick={() => renamePlayer(player)}
              icon={<PencilSquareIcon className="h-5 w-5 fill-secondary-600 " />}
              label="Renombrar"
            />
            <MenuOption
              disabled={!!player.isReplacedBy}
              onClick={() => replacePlayer(player)}
              icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800 " />}
              label="Reemplazar"
            />
            <MenuOption
              disabled={player.isDeleted || !!player.isReplacedBy}
              onClick={() => removePlayer(player)}
              icon={<ArrowDownCircleIcon className="h-5 w-5 fill-red-800 " />}
              label="Dar de baja"
            />
          </FloatingMenu>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;
