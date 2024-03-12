import { Player } from "@/types";
import classNames from "classnames";
import { FC } from "react";

interface PlayerNameProps {
  player: Player;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, className }) => (
  <span className={classNames("flex items-center gap-1", className)}>
    {player.name} {player.details && <span className="text-[9px]  font-semibold uppercase">({player.details})</span>}
  </span>
);

export default PlayerName;
