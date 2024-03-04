import { FC } from "react";
import { Player } from "@/types";
import { ShirtIcon } from "@/components/Icons";
import { uniqueId } from "lodash";
import classNames from "classnames";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => (
  <div className="relative w-1/2 bg-white rounded-md p-2">
    <label
      className={classNames("flex justify-start", {
        "justify-end": shirtPosition === "right",
      })}
    >
      <ShirtIcon color={color} />
    </label>

    <ul className="divide-y divide-gray-200">
      {players?.map((player) => (
        <li
          key={uniqueId(`${player.name}-${player.details}`)}
          className="py-1 flex gap-1 font-display text-[16px] p-1 my-2 capitalize justify-center items-center text-gray-600"
        >
          <span>{player.name}</span>
          {player.details && (
            <span className="text-[10px] font-semibold uppercase text-secondary-600">({player.details})</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default PlayersList;
