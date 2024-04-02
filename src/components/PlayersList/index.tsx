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
import { usePrefersColorScheme } from "@/hooks/usePrefersColorScheme";
import { getContrastColor } from "@/utils";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { removePlayer, replacePlayer, renamePlayer } = usePlayers();
  const { isDarkMode } = usePrefersColorScheme();
  const borderColor = getContrastColor(color, isDarkMode);

  return (
    <div className="relative w-1/2 primary-bg rounded-md p-2 border-l-4" style={{ borderColor }}>
      <div className={classNames("flex justify-start mb-2", { "justify-end": shirtPosition === "right" })}>
        <ShirtIcon color={color} />
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {players?.map((player, index) => (
          <FloatingMenu
            key={uniqueId(`${player.name}-${player.details}`)}
            className={classNames(
              "relative flex gap-1 font-display text-[16px] capitalize justify-center items-center text-gray-600 w-full group dark:text-gray-400"
            )}
            trigger={
              <>
                <span
                  className={classNames(
                    "text-xs font-bold text-gray-600 opacity-60 absolute left-2 top-1/2 transform -translate-y-1/2"
                  )}
                >
                  {index + 1}.
                </span>

                <PlayerName player={player} />

                <EllipsisVerticalIcon className="h-5 w-5 absolute right-1 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
              </>
            }
          >
            <MenuOption
              onClick={() => renamePlayer(player)}
              icon={<PencilSquareIcon className="h-5 w-5 fill-secondary-600 dark:fill-secondary-400" />}
              label="Renombrar"
            />
            <MenuOption
              onClick={() => replacePlayer(player)}
              icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800 dark:fill-primary-400" />}
              label="Reemplazar"
            />
            <MenuOption
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
