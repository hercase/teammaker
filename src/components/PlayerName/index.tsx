"use client";

import { FC, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Player } from "@/types";
import classNames from "classnames";
import usePlayers from "@/hooks/usePlayers";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { usePersistedStore } from "@/store/usePersistedStore";

interface PlayerNameProps {
  player: Player;
  isReplacement?: string;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, isReplacement, className }) => {
  const { exchangePlayers } = usePlayers();
  const { random } = usePersistedStore();
  const ref = useRef<HTMLParagraphElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "player",
    item: { id: player._key },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: false, // TODO: Implement drag functionality
  }));

  const [{ isOver }, drop] = useDrop({
    accept: "player",
    drop: (item: { id: string }) => {
      if (player._key) {
        exchangePlayers(item.id, player._key);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    canDrop: (item: { id: string }) => item.id !== player._key,
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
      {isReplacement && <ArrowPathIcon className="h-3 w-3 fill-secondary-600" />}
      {player.name}
      {player.details && (
        <span className="flex text-[9px] font-semibold uppercase">
          (<span className="block truncate max-w-12">{player.details}</span>)
        </span>
      )}
    </p>
  );
};

export default PlayerName;
