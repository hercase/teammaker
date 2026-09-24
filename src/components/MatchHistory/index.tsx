import React, { FC } from "react";
import classNames from "classnames";
import { ArrowDownCircleIcon, ArrowsRightLeftIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import usePlayers from "@/hooks/usePlayers";
import { splitFullName } from "@/utils";

/*
  Written the way the team list writes it: the name at full size, the rest smaller and in brackets.
  An event stores the two already joined into one string, so they are split apart again here rather
  than migrating every event that is already saved on someone's phone.
*/
const EventName: FC<{ children: string }> = ({ children }) => {
  const { name, details } = splitFullName(children);

  if (!details) return <span className="truncate">{children}</span>;

  return (
    <>
      <span className="shrink-0">{name}</span>
      <small className="truncate text-sm font-medium opacity-80 [font-variant-caps:all-small-caps]">({details})</small>
    </>
  );
};

const MatchHistory = () => {
  const { history } = usePlayers();

  if (!history.length) return null;

  const renderText = (type: string) => {
    if (type === "replace") return "reemplazado por";
    if (type === "rename") return "renombrado a";
    if (type === "delete") return "se dio de baja.";
    if (type === "restore") return "volvió a sumarse.";
    if (type === "join") return "se sumó.";
    if (type === "shuffle") return "se mezclaron los equipos.";
  };

  return (
    <ul className="panel flex flex-col gap-1 p-3">
      {history.map(({ id, old_name, new_name, type, date }, index) => (
        <li
          // Two events land in the same second all the time, so the timestamp never was a key.
          key={id ?? `${date}-${index}`}
          className="flex flex-wrap items-center gap-1 text-sm"
        >
          <span className="text-text-subtle tabular-nums">{format(date, "dd/MM HH:mm")}</span>

          {/*
            A shuffle is the one event with nobody in it, so it gets the mark instead of a name:
            the same ⇄ the card wears for "Sorteo al azar", in the same cyan, because it is the same
            claim being made again. An arrow here would say somebody arrived or left, and nobody did.
          */}
          {old_name ? (
            /* min-w-0 + truncate so one long name cannot stretch the line: the name itself is
               already cut short when the Player is made, so this only bites on a narrow phone. */
            /* Cyan means came in, rose means went out — the same two meanings the team list uses. */
            <span
              className={classNames("flex min-w-0 items-center gap-1 capitalize", {
                "text-secondary-400": type === "restore" || type === "join",
                "text-error-400": type !== "restore" && type !== "join",
              })}
            >
              {type === "restore" || type === "join" ? (
                <ArrowUpCircleIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowDownCircleIcon className="h-4 w-4 shrink-0" />
              )}
              <EventName>{old_name}</EventName>
            </span>
          ) : (
            <ArrowsRightLeftIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-secondary-400" />
          )}

          <span className="text-text-muted">{renderText(type)}</span>

          {new_name && (
            <>
              <span className="flex min-w-0 items-center gap-1 capitalize text-secondary-400">
                <ArrowUpCircleIcon className="h-4 w-4 shrink-0" />
                <EventName>{new_name}</EventName>
                {/* -ml-1 eats the flex gap: the line read "por Nico ." with the point adrift. */}
                <span className="-ml-1 shrink-0">.</span>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MatchHistory;
