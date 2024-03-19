import { usePlayersStore } from "@/store";
import { Player } from "@/types";
import useAlert from "@/hooks/useAlert";

const usePlayers = () => {
  const alert = useAlert();
  const {
    players,
    substitutes,
    removePlayer: _removePlayer,
    replacePlayer: _replacePlayer,
    renamePlayer: _renamePlayer,
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
      inputValidator: (value: string) => {
        if (!value) return "Debes seleccionar un jugador";
        if (!/^[a-zA-Z\s\(\)]+$/.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
      },
      cb: (user: string) => _replacePlayer(player.id, user),
    });
  };

  const renamePlayer = (player: Player) => {
    alert({
      text: `Ingresa el nuevo nombre para ${player.name}`,
      input: "text",
      inputValidator: (value: string) => {
        if (!value) return "Debes ingresar un nombre";
        if (!/^[a-zA-Z\s\(\)]+$/.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
      },
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
    ...store,
  };
};

export default usePlayers;
