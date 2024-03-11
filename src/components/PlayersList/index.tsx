import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";

import classNames from "classnames";
import { ShirtIcon } from "@/components/Icons";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import { ArrowDownCircleIcon, ArrowsUpDownIcon, EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { useMatchStore } from "@/store";
import useAlert from "@/hooks/useAlert";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { substitutes, replacements, replacePlayer } = useMatchStore();
  const playersList = usePlayers(players || []);

  console.log("🚀 ~ playersList:", playersList);

  const alert = useAlert();

  const handleDelete = (player: Player) => {
    alert({
      text: `¿Estás seguro que deseas dar de baja a ${player.name}?`,
      cb: () => replacePlayer(player.id),
    });
  };

  const handleReplace = (player: Player) => {
    alert({
      text: `Selecciona el jugador que reemplazará a ${player.name}`,
      input: "text",
      inputValidator: (value: string) => {
        if (!value) return "Debes seleccionar un jugador";
        if (!/^[a-zA-Z\s\(\)]+$/.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
      },
      cb: (user) => replacePlayer(player.id, user),
    });
  };

  return (
    <div className="relative w-1/2 bg-white rounded-md p-2">
      <label
        className={classNames("flex justify-start mb-2", {
          "justify-end": shirtPosition === "right",
        })}
      >
        <ShirtIcon color={color} />
      </label>

      <ul className="divide-y divide-gray-200">
        {playersList?.map((player) => {
          const replacement = replacements?.find((replace) => replace.old === player.id);

          return (
            <FloatingMenu
              key={uniqueId(`${player.name}-${player.details}`)}
              className={classNames(
                "relative flex gap-1 font-display text-[16px] p-1 py-2 capitalize justify-center items-center text-gray-600 w-full group hover:bg-gray-200"
              )}
              trigger={
                <>
                  <PlayerName player={player} />

                  <EllipsisVerticalIcon className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
                </>
              }
            >
              <MenuOption
                onClick={() => handleReplace(player)}
                icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800" />}
                label="Reemplazar"
              />
              <MenuOption
                disabled={replacement ? replacement?.new === undefined : false}
                onClick={() => handleDelete(player)}
                icon={<ArrowDownCircleIcon className="h-5 w-5 fill-red-800" />}
                label="Dar de baja"
              />
            </FloatingMenu>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayersList;
