import { FC } from "react";
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import { MatchEvent } from "@/types";
import { formatMatchDate } from "@/utils";

interface HistoryProps {
  history: MatchEvent[];
}

const MatchHistory: FC<HistoryProps> = ({ history = [] }) => {
  if (!history.length) return null;

  const renderText = (type: string) => {
    if (type === "replace") return "reemplazado por";
    if (type === "rename") return "renombrado a";
    if (type === "delete") return "se dio de baja.";
  };

  return (
    <ul
      className="flex flex-col justify-between bg-white dark:bg-gray-800
    rounded-md p-2"
    >
      {history.map(({ old_name, new_name, type, date }) => (
        <li key={formatMatchDate(date)} className="flex gap-1 items-center text-gray-600 text-xs flex-wrap">
          <span className="text-gray-400">{}</span>

          <span className="flex items-center text-red-600 capitalize gap-1">
            <ArrowDownCircleIcon className="w-4 h-4" />
            <span>{old_name}</span>
          </span>

          <span className="text-gray-600 dark:text-gray-400">{renderText(type)}</span>

          {new_name && (
            <>
              <span className="flex items-center text-green-600 capitalize gap-1">
                <ArrowUpCircleIcon className="w-4 h-4" />
                <span>{new_name}</span>
                <span>.</span>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MatchHistory;
