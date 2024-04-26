import { useMatchStore } from "@/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import usePlayers from "@/hooks/usePlayers";

const InfoCard = () => {
  const { organizer, date, location, random } = useMatchStore();
  const { players } = usePlayers();
  return (
    <div className="col-span-1 flex shadow-sm rounded-md w-full mx-auto">
      <div className="flex-shrink-0 flex items-center justify-center px-4 bg-purple-600 dark:bg-purple-800 text-white text-sm font-medium rounded-l-md">
        <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate dark:bg-gray-800 dark:border-gray-700 ">
        <div className="flex-1 px-4 py-2 text-sm truncate">
          <p className="text-gray-900 dark:text-gray-300 font-medium text-md">{location}</p>
          {date && (
            <p className="text-gray-900 font-medium text-md first-letter:uppercase dark:text-gray-300">
              {format(date, "EEEE dd/MM - p", { locale: es })} hs
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400">Creado por {organizer}</p>
          <p className="text-gray-500 dark:text-gray-400">{players.length} Jugadores</p>
          {random && <p className="text-gray-500 dark:text-gray-400">Lista aleatoria 🎲</p>}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
