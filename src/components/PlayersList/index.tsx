import { FC } from "react";
import { Player } from "@/types";
import { ShirtIcon } from "@/components/Icons";

interface PlayersListProps {
  color: string;
  setColor: (color: string) => void;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ color, setColor, players }) => {
  return (
    <div className="relative w-1/2 bg-white rounded-md p-2">
      <div>
        <ShirtIcon color={color} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <ul className="divide-y divide-gray-200">
        {players?.map((player) => (
          <li key={player.name} className="py-1 flex font-display text-lg p-1 my-2 capitalize justify-center">
            {player.name} - {player.details}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;
