import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";
import classNames from "classnames";
import { ShirtIcon } from "@/components/Icons";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import { ArrowsUpDownIcon, EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useMatchStore } from "@/store";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { replacements } = useMatchStore();

  return (
    <div className="relative w-1/2 bg-white rounded-md p-2">
      <label
        className={classNames("flex justify-start mb-2", {
          "justify-end": shirtPosition === "right",
        })}
      >
        <ShirtIcon color={color} />
      </label>

      <ul className="divide-y divide-gray-200">
        {players?.map((player) => {
          const replacement = replacements.find((replace) => replace.old === player.id);
          return (
            <FloatingMenu
              key={uniqueId(`${player.name}-${player.details}`)}
              className={classNames(
                "relative flex gap-1 font-display text-[16px] p-1 py-2 capitalize justify-center items-center text-gray-600 w-full group hover:bg-gray-200",
                { "filter blur-sm": replacement }
              )}
              trigger={
                <>
                  <span>{player.name}</span>
                  {player.details && (
                    <span className="text-[10px] font-semibold uppercase text-secondary-600">({player.details})</span>
                  )}
                  <EllipsisVerticalIcon className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
                </>
              }
            >
              <MenuOption icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800" />} label="Reemplazar" />
              <MenuOption icon={<TrashIcon className="h-5 w-5 fill-red-800" />} label="Eliminar" />
            </FloatingMenu>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayersList;
