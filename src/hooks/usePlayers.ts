import { usePlayersStore } from "@/store";
import { Player } from "@/types";
import useAlert from "@/hooks/useAlert";
import { validateName } from "@/utils";

const usePlayers = () => {
  const alert = useAlert();
  const {
    players,
    substitutes,
    removePlayer: _removePlayer,
    replacePlayer: _replacePlayer,
    renamePlayer: _renamePlayer,
    exchangePlayers,
    ...store
  } = usePlayersStore();

  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

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
    substitutes,
    teamA,
    teamB,
    removePlayer,
    replacePlayer,
    renamePlayer,
    exchangePlayers,
    ...store,
  };
};

export default usePlayers;
