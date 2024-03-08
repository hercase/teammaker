import { FC } from "react";
import { Player } from "@/types";
import { uniqueId } from "lodash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import classNames from "classnames";
import { ShirtIcon } from "@/components/Icons";
import FloatingMenu, { MenuOption } from "@/components/FloatingMenu";
import {
  ArrowDownCircleIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/20/solid";
import { useMatchStore } from "@/store";

const MySwal = withReactContent(Swal);

interface PlayersListProps {
  shirtPosition?: "left" | "right";
  color?: string;
  players?: Player[];
}

const PlayersList: FC<PlayersListProps> = ({ shirtPosition = "left", color = "#151d65", players }) => {
  const { replacements, replacePlayer } = useMatchStore();

  const handleDelete = (player: Player) => {
    MySwal.fire({
      title: "Dar de baja",
      text: `¿Estás seguro que deseas dar de baja a ${player.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        replacePlayer(player.id);
      }
    });
  };

  const handleReplace = (player: Player) => {};

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
          const replacement = replacements.find((replace) => replace.old === player.id);

          return (
            <FloatingMenu
              key={uniqueId(`${player.name}-${player.details}`)}
              className={classNames(
                "relative flex gap-1 font-display text-[16px] p-1 py-2 capitalize justify-center items-center text-gray-600 w-full group hover:bg-gray-200"
              )}
              trigger={
                <>
                  <p className="flex">
                    {replacement && <ChevronDownIcon className="h-5 w-5 fill-red-800" />}
                    <span className={classNames({ "line-through opacity-50": replacement })}>{player.name}</span>
                  </p>
                  {player.details && (
                    <span className="text-[10px] font-semibold uppercase text-secondary-600">({player.details})</span>
                  )}
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
