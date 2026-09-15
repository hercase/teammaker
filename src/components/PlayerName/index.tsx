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
        // flex-1, not w-full: this sits beside the ⋮ in a flex row, and w-full sizes to the
        // text — so the drag ghost and the drop outline hugged the letters. flex-1 takes the
        // rest of the row, which is the block you are actually moving.
        //
        // Padding inside the outline, not margin around it: the dashed drop target has to look
        // like the name card, not a tight ring on the word. Margin would push neighbours away
        // without growing what the border wraps.
        //
        // Border colour is switched, not layered: border-transparent and border-primary-400 both
        // set the same property, and in Tailwind the one that wins is stylesheet order, not
        // className order — so the permanent transparent used to hide the dashed drop target.
        "flex min-h-11 min-w-0 flex-1 select-none items-center gap-1 rounded-md border-2 px-1.5 touch-manipulation",
        isOver && !isDragging ? "border-dashed border-primary-400" : "border-solid border-transparent",
        {
          "opacity-50": isDragging,
          "cursor-move": !random,
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
