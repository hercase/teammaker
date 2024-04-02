import { FC } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Person } from "@/types";
import { formatMatchDate } from "@/utils";

interface InfoCardProps {
  date: Date | null;
  location: string;
  organizer: Person;
  random: boolean;
  playersLength: number;
}

const InfoCard: FC<InfoCardProps> = ({ date, location, organizer, random, playersLength }) => (
  <div className="col-span-1 flex shadow-sm rounded-md w-full mx-auto">
    <div className="flex-shrink-0 flex items-center justify-center px-4 bg-purple-600 dark:bg-purple-800 text-white text-sm font-medium rounded-l-md">
      <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
    </div>
    <div className="flex-1 flex items-center justify-between rounded-r-md truncate primary-bg">
      <div className="flex-1 px-4 py-2 text-sm truncate">
        <p className="text-gray-900 dark:text-gray-300 font-medium text-md">{location}</p>
        {date && (
          <p className="text-gray-900 font-medium text-md first-letter:uppercase dark:text-gray-300">
            {formatMatchDate(date)}
          </p>
        )}
        <p className="text-gray-500 dark:text-gray-400">Creado por {organizer.nickname}</p>
        <p className="text-gray-500 dark:text-gray-400">{playersLength} Jugadores</p>
        {random && <p className="text-gray-500 dark:text-gray-400">Lista aleatoria 🎲</p>}
      </div>
    </div>
  </div>
);

export default InfoCard;
