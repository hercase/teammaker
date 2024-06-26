import { FC, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Player } from "@/types";
import classNames from "classnames";
import usePlayers from "@/hooks/usePlayers";
import { useMatchStore } from "@/store";

interface PlayerNameProps {
  player: Player;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, className }) => {
  const { bench } = usePlayers();
  const substitute = bench.find((p) => p.id === player.isReplacedBy);
  const currentPlayers = substitute || player;

  const { exchangePlayers } = usePlayers();
  const { random } = useMatchStore();
  const ref = useRef<HTMLParagraphElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "player",
    item: { id: player.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !random,
  }));

  const [{ isOver }, drop] = useDrop({
    accept: "player",
    drop: (item: { id: string }) => {
      if (player.id) {
        exchangePlayers(item.id, player.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    canDrop: (item: { id: string }) => item.id !== player.id,
  });

  drag(drop(ref));

  return (
    <p
      ref={ref}
      className={classNames(
        "flex gap-1 justify-center items-center w-full p-1 py-2 user-select-none",
        {
          "opacity-50": isDragging,
          "cursor-move": !random,
          "border-2 border-dashed border-gray-300 ": isOver && !isDragging,
        },
        className
      )}
    >
      {currentPlayers.name}
      {currentPlayers.details && (
        <span className="flex text-[9px] font-semibold uppercase">
          (<span className="block truncate max-w-12">{currentPlayers.details}</span>)
        </span>
      )}
    </p>
  );
};

export default PlayerName;
