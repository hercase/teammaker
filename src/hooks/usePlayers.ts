import { usePlayersStore } from "@/store";
import { Player } from "@/types";
import useAlert from "@/hooks/useAlert";
import { validateName } from "@/utils";

const usePlayers = () => {
  const alert = useAlert();
  const {
    players,
    bench,
    removePlayer: _removePlayer,
    replacePlayer: _replacePlayer,
    renamePlayer: _renamePlayer,
    ...store
  } = usePlayersStore();

  const removePlayer = (player: Player) => {
    alert({
      text: `¿Estás seguro que deseas dar de baja a ${player.name}?`,
      cb: () => _removePlayer(player.id),
    });
  };

  const replacePlayer = (player: Player) => {
    alert({
      text: `Ingresa el nombre del jugador que reemplazará a ${player.name}`,
      input: "text",
      inputValidator: validateName,

      cb: (user: string) => _replacePlayer(player.id, user),
    });
  };

  const renamePlayer = (player: Player) => {
    alert({
      text: `Ingresa el nuevo nombre para ${player.name}`,
      input: "text",
      inputValidator: validateName,
      cb: (user: string) => _renamePlayer(player.id, user),
    });
  };

  return {
    players,
    bench,
    removePlayer,
    replacePlayer,
    renamePlayer,
    ...store,
  };
};

export default usePlayers;
