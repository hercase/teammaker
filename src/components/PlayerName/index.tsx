import { Player } from "@/types";
import classNames from "classnames";
import { FC } from "react";

interface PlayerNameProps {
  player: Player;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, className }) => (
  <p className={classNames("flex items-center gap-1", className)}>
    {player.name}
    {player.details && (
      <span className="flex text-[9px] font-semibold uppercase">
        (<span className="block truncate max-w-12">{player.details}</span>)
      </span>
    )}
  </p>
);

export default PlayerName;
