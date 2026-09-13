import React from "react";
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import usePlayers from "@/hooks/usePlayers";

const MatchHistory = () => {
  const { history } = usePlayers();

  if (!history.length) return null;

  const renderText = (type: string) => {
    if (type === "replace") return "reemplazado por";
    if (type === "rename") return "renombrado a";
    if (type === "delete") return "se dio de baja.";
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

          {/* min-w-0 + truncate so one long name cannot stretch the line: the name itself is
              already cut short when the Player is made, so this only bites on a narrow phone. */}
          <span className="flex min-w-0 items-center gap-1 capitalize text-error-400">
            <ArrowDownCircleIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{old_name}</span>
          </span>

          <span className="text-text-muted">{renderText(type)}</span>

          {new_name && (
            <>
              <span className="flex min-w-0 items-center gap-1 capitalize text-secondary-400">
                <ArrowUpCircleIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{new_name}</span>
                <span className="shrink-0">.</span>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MatchHistory;
