import { FC } from "react";
import { Player } from "@/types";
import { ShirtIcon } from "@/components/Icons";
import { uniqueId } from "lodash";
import classNames from "classnames";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color: string;
  setColor: (color: string) => void;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color, setColor, players }) => (
  <div className="relative w-1/2 bg-white rounded-md p-2">
    <label
      className={classNames("flex justify-start", {
        "justify-end": shirtPosition === "right",
      })}
    >
      <ShirtIcon color={color} />
      <input className="hidden" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
    </label>

    <ul className="divide-y divide-gray-200">
      {players?.map((player) => (
        <li
          key={uniqueId(`${player.name}-${player.details}`)}
          className="py-1 flex gap-1 font-display text-lg p-1 my-2 capitalize justify-center items-center text-gray-600"
        >
          <span>{player.name}</span>
          {player.details && (
            <p className="relative">
              <span className="absolute top-y-1/2 left-1 -translate-y-1/2 text-xs font-medium uppercase text-secondary-500">
                ({player.details})
              </span>
            </p>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default PlayersList;
