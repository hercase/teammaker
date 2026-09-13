import { FC } from "react";
import { Kit, Player, TeamSide } from "@/types";

import classNames from "classnames";
import ShirtIcon from "@/components/Icons/ShirtIcon";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";
import { kitColor, kitLabel } from "@/utils/kit";

interface PlayersListProps {
  side: TeamSide;
  kit: Kit;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ side, kit, players }) => {
  const { removePlayer, replacePlayer, renamePlayer } = usePlayers();
  const color = kitColor(kit, side);
  const label = kitLabel(kit, side);
  // Someone who dropped out without a replacement is not playing, so the head should not count them.
  const playing = (players ?? []).filter((player) => !(player.isDeleted && !player.isReplacedBy)).length;

  return (
    /* The kit colours the whole outline of the panel, not just one edge, so each team reads as its
       own block at a glance in the screenshot. */
    <div
      /* flex-1 min-w-0 rather than w-1/2: two halves plus the gap between them add up to more than
         the row, and a flex item will not shrink below its own content unless min-width is cleared,
         so a long name in one panel used to push the whole page sideways on a phone. */
      className="relative min-w-0 flex-1 rounded-card border bg-surface p-2.5 sm:p-3"
      style={{ borderColor: color ?? "var(--color-border)" }}
    >
      {/*
        Both panels read the same way round. The head carries what the group needs at a glance in
        the screenshot: what this team wears, and how many of them there are.
      */}
      <div className="mb-2 flex min-h-8 items-center gap-2 sm:mb-3">
        {kit.mode !== "bibs" && color && <ShirtIcon color={color} size={30} />}
        <span className="font-display text-lg font-bold uppercase tracking-wide text-text">{label}</span>
        <span className="ml-auto shrink-0 rounded-full bg-surface-raised px-2.5 py-1 text-xs text-text-muted">
          <span className="font-semibold tabular-nums text-text">{playing}</span>
        </span>
      </div>

      {/* Rows as separate cards rather than hairline-divided lines: each player is a thing you can
          act on, and at a glance the two teams read as stacks of people, not as paragraphs. */}
      <ul className="flex flex-col gap-2">
        {players?.map((player) => (
          /* A ul may only contain li. Hanging the buttons straight off it made the list stop being
             a list: a screen reader announced six loose buttons instead of a team of six. */
          <li key={player.id}>
            <FloatingMenu
              label={`Opciones de ${player.name}`}
              className={classNames(
                "group relative flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-lg bg-surface-raised pl-2.5 pr-1.5 text-base capitalize text-text transition-colors hover:bg-surface-hover sm:pl-3 sm:pr-2"
              )}
              trigger={
                <>
                  {player.isReplacedBy && (
                    <ArrowPathIcon aria-hidden="true" className="h-4 w-4 shrink-0 fill-secondary-400" />
                  )}

                  {player.isDeleted && !player.isReplacedBy && (
                    <ArrowDownCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0 fill-error-400" />
                  )}

                  <PlayerName player={player} />

                  {/* Left out of the shared image: it is a control, and the picture is not. */}
                  <EllipsisVerticalIcon
                    aria-hidden="true"
                    data-share="hide"
                    className="ml-auto h-5 w-5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
                  />
                </>
              }
            >
              <MenuOption
                disabled={player.isDeleted}
                onClick={() => renamePlayer(player)}
                icon={<PencilSquareIcon className="h-5 w-5 fill-secondary-400" />}
                label="Renombrar"
              />
              <MenuOption
                disabled={!!player.isReplacedBy}
                onClick={() => replacePlayer(player)}
                icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-400" />}
                label="Reemplazar"
              />
              <MenuOption
                disabled={player.isDeleted || !!player.isReplacedBy}
                onClick={() => removePlayer(player)}
                icon={<ArrowDownCircleIcon className="h-5 w-5 fill-error-400" />}
                label="Dar de baja"
              />
            </FloatingMenu>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;
