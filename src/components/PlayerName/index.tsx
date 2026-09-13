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
  const { bench, tags, exchangePlayers } = usePlayers();
  const substitute = bench.find((p) => p.id === player.isReplacedBy);
  const currentPlayers = substitute || player;

  /*
    The same two meanings the history already uses, carried into the list that gets screenshotted:
    cyan came in, rose went out. A dropped player used to render a bare "-" with the name hidden,
    so the group could not tell from the teams who was missing.
  */
  const isOut = Boolean(player.isDeleted);
  const isSubstitute = Boolean(substitute);

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
        // min-w-0: without it a flex item refuses to shrink below its text, so a long name pushed
        // the row menu off the right edge of the card instead of being truncated.
        // One line per player, always: a row that grows to two lines makes the two teams stop
        // reading as two even stacks. The surname gives way instead, with an ellipsis.
        "flex min-h-11 w-full min-w-0 select-none items-center gap-1 touch-manipulation",
        {
          "opacity-50": isDragging,
          "cursor-move": !random,
          "border-2 border-dashed border-primary-400 rounded-md": isOver && !isDragging,
          "text-error-400 line-through decoration-error-400/60": isOut,
          "text-secondary-300": isSubstitute,
        },
        className
      )}
    >
      {/* The name itself never gives way; it is already capped at generatePlayer. */}
      <span className="shrink-0">{currentPlayers.name}</span>
      {/*
        In brackets like everything else hanging off a name. A bare "1" beside "Mati" read as a
        count or a shirt number; "(1)" reads as which Mati, which is what it is.
      */}
      {tags[currentPlayers.id] && (
        <span className="shrink-0 text-xs font-medium text-text-muted">({tags[currentPlayers.id]})</span>
      )}
      {/* The rest of the name, smaller and in brackets. Not a badge: it is not a status. */}
      {currentPlayers.details && (
        <span className="min-w-0 truncate text-xs font-medium uppercase text-text-muted">
          ({currentPlayers.details})
        </span>
      )}
    </p>
  );
};

export default PlayerName;
