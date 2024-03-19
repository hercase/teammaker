import { FC, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Player } from "@/types";
import classNames from "classnames";
import usePlayers from "@/hooks/usePlayers";
import { useMatchStore } from '@/store';

interface PlayerNameProps {
  player: Player;
  className?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ player, className }) => {
  const { exchangePlayers } = usePlayers();
  const { random } = useMatchStore();
  const ref = useRef<HTMLParagraphElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: { id: player.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !random,
  }));

  const [, drop] = useDrop({
    accept: 'player',
    drop: (item: { id: string }) => {
      if (player.id) {
        exchangePlayers(item.id, player.id);
      }
    },
  });

  drag(drop(ref));
  
  return (
    <p
      ref={ref}
      className={classNames("w-full", isDragging ? 'opacity-50' : 'opacity-100', className)}
    >
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
