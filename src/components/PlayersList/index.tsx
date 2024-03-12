import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";

import classNames from "classnames";
import { ShirtIcon } from "@/components/Icons";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import { ArrowDownCircleIcon, ArrowPathIcon, ArrowsUpDownIcon, EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import useAlert from "@/hooks/useAlert";
import PlayerName from "../PlayerName";
import usePlayers from "@/hooks/usePlayers";

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { substitutes, removePlayer, replacePlayer } = usePlayers();

  const alert = useAlert();

  const handleDelete = (player: Player) => {
    alert({
      text: `¿Estás seguro que deseas dar de baja a ${player.name}?`,
      cb: () => removePlayer(player.id),
    });
  };

  const handleReplace = (player: Player) => {
    alert({
      text: `Ingresa el nombre del jugador que reemplazará a ${player.name}`,
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
        {players?.map((player) => {
          const substitute = substitutes.find((p) => p.id === player.isReplacedBy);

          return (
            <FloatingMenu
              key={uniqueId(`${player.name}-${player.details}`)}
              className={classNames(
                "relative flex gap-1 font-display text-[16px] p-1 py-2 capitalize justify-center items-center text-gray-600 w-full group hover:bg-gray-200"
              )}
              trigger={
                <>
                  {player.isDeleted && !substitute && <span>-</span>}

                  {substitute && (
                    <>
                      <ArrowPathIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 fill-secondary-600" />
                      <PlayerName player={substitute} />
                    </>
                  )}

                  {!substitute && !player.isDeleted && <PlayerName player={player} />}

                  <EllipsisVerticalIcon className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
                </>
              }
            >
              <MenuOption
                disabled={!!player.isReplacedBy}
                onClick={() => handleReplace(player)}
                icon={<ArrowsUpDownIcon className="h-5 w-5 fill-primary-800" />}
                label="Reemplazar"
              />
              <MenuOption
                disabled={player.isDeleted || !!player.isReplacedBy}
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
