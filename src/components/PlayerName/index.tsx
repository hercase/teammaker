import { FC } from "react";

interface PlayerNameProps {
  name: string;
  details?: string;
}

const PlayerName: FC<PlayerNameProps> = ({ name, details }) => (
  <div className="relative flex gap-1 font-display text-[16px] p-1 py-2 capitalize justify-center items-center text-gray-600 w-full group hover:bg-gray-200 cursor-pointer">
    <span>{name}</span>
    {details && <span className="text-[10px] font-semibold uppercase text-secondary-600">({details})</span>}
  </div>
);

export default PlayerName;
