import { FC } from "react";
import { Chip } from "@heroui/react";
import Button from "@/components/Button";
import { Kit, Player, TeamSide } from "@/types";

import ShirtIcon from "@/components/Icons/ShirtIcon";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";
import { countPlaying } from "@/utils";
import { kitColor, kitEdge, kitLabel } from "@/utils/kit";

interface PlayersListProps {
  side: TeamSide;
  kit: Kit;
  players?: Player[];
  // This side is short, or the cap still has room: offer to add someone here.
  canAdd?: boolean;
}

const PlayersList: FC<PlayersListProps> = ({ side, kit, players, canAdd = false }) => {
  const { removePlayer, replacePlayer, renamePlayer, addPlayer } = usePlayers();
  const color = kitColor(kit, side);
  const edge = kitEdge(kit, side);
  const label = kitLabel(kit, side);
  const playing = countPlaying(players ?? []);

  return (
    /* The kit colours the whole outline of the panel, not just one edge, so each team reads as its
       own block at a glance in the screenshot. */
    <div
      /* flex-1 min-w-0 rather than w-1/2: two halves plus the gap between them add up to more than
         the row, and a flex item will not shrink below its own content unless min-width is cleared,
         so a long name in one panel used to push the whole page sideways on a phone. */
      className="team-panel relative min-w-0 flex-1 rounded-card border p-2.5 sm:p-3"
      /* --team-color feeds the team-panel / team-row utilities; unset, they draw the plain surface. */
      style={{ borderColor: edge ?? "var(--color-border)", ...(color ? { "--team-color": color } : {}) }}
    >
      {/*
        Both panels read the same way round. The head carries what the group needs at a glance in
        the screenshot: what this team wears, and how many of them there are.
      */}
      <div className="mb-2 flex min-h-8 items-center gap-2 sm:mb-3">
        {kit.mode !== "bibs" && color && (
          <ShirtIcon color={color} outline={edge !== color ? (edge ?? undefined) : undefined} size={30} />
        )}
        <span className="text-base font-bold uppercase tracking-wide text-text">{label}</span>
        {/* HeroUI's Chip, in its soft default, rather than a span rounded by hand. It is the one
            other thing besides the switch track painted from --default; see the theme note. */}
        <Chip variant="soft" color="default" className="ml-auto shrink-0 tabular-nums">
          {playing}
        </Chip>
      </div>

      {/* Rows as separate cards rather than hairline-divided lines: each player is a thing you can
          act on, and at a glance the two teams read as stacks of people, not as paragraphs. */}
      {/*
        A row that dropped out is gone from the list. It used to stay, struck through, so the group
        could see who was missing; now "Falta uno en Equipo B" and the history say so, and the
        struck name only made the team look like it had one more. Volver a sumar moved to the
        Sumar jugador dialog, which offers the name first.
      */}
      <ul className="flex flex-col gap-2">
        {players
          ?.filter((player) => !player.isDeleted)
          .map((player) => (
            /* A ul may only contain li. Hanging the buttons straight off it made the list stop being
             a list: a screen reader announced six loose buttons instead of a team of six. */
            <li
              key={player.id}
              /*
              The row is not a button any more. It was, and the whole row was also the menu trigger,
              so React Aria read the end of a drag as a press and opened the menu every time someone
              moved a player. The row is for dragging; the ⋮ is for the menu. One gesture each.
            */
              className="team-row group relative flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 text-base capitalize text-text transition-colors sm:pl-3 sm:pr-2"
            >
              {player.isReplacedBy && (
                <ArrowPathIcon aria-hidden="true" className="h-4 w-4 shrink-0 fill-secondary-400" />
              )}

              {player.isDeleted && !player.isReplacedBy && (
                <ArrowDownCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0 fill-error-400" />
              )}

              <PlayerName player={player} />

              {/* Left out of the shared image: it is a control, and the picture is not. */}
              <FloatingMenu
                label={`Opciones de ${player.name}`}
                className="ml-auto grid size-8 shrink-0 place-items-center rounded-md text-text-subtle transition-colors hover:bg-surface hover:text-text"
                trigger={<EllipsisVerticalIcon aria-hidden="true" className="h-5 w-5" />}
                data-share="hide"
              >
                {/* All three act on whoever the row shows, substitute included: a substitute who came
                  in can drop out or be replaced like anyone else. */}
                <MenuOption
                  onClick={() => renamePlayer(player)}
                  icon={<PencilSquareIcon className="h-5 w-5 fill-secondary-400" />}
                  label="Renombrar"
                />
                <MenuOption
                  onClick={() => replacePlayer(player)}
                  icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-400" />}
                  label="Reemplazar"
                />
                <MenuOption
                  onClick={() => removePlayer(player)}
                  icon={<ArrowDownCircleIcon className="h-5 w-5 fill-error-400" />}
                  label="Dar de baja"
                />
              </FloatingMenu>
            </li>
          ))}
      </ul>

      {/*
        "Falta uno en Oscuras" used to be a statement with no way to act on it: an odd list leaves
        one side a player short and nothing on the screen could add one. The button lives at the
        foot of the side that needs someone, and stays out of the picture like every control.
      */}
      {canAdd && (
        <div className="mt-2" data-share="hide">
          <Button variant="ghost" className="w-full" onClick={() => addPlayer(side, label, players ?? [])}>
            <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
            Sumar jugador
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayersList;
