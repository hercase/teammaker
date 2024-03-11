import { Player } from "@/types";
import { FC } from "react";

interface PlayerNameProps {
  player: Player;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, className }) => (
  <span className={className}>
    {player.name} {player.details && `(${player.details})`}
  </span>
);

export default PlayerName;
