import { usePlayersStore } from "@/store";
import { Player } from "@/types";

const usePlayers = () => {
  const { players, removePlayer, replacePlayer, ...store } = usePlayersStore();

  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

  const deletePlayer = (player: Player) => {
    alert({
      text: `¿Estás seguro que deseas dar de baja a ${player.name}?`,
      cb: () => removePlayer(player.id),
    });
  };

  const changePlayer = (player: Player) => {
    alert({
      text: `Ingresa el nombre del jugador que reemplazará a ${player.name}`,
      input: "text",
      inputValidator: (value: string) => {
        if (!value) return "Debes seleccionar un jugador";
        if (!/^[a-zA-Z\s\(\)]+$/.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
      },
      cb: (user: string) => replacePlayer(player.id, user),
    });
  };

  return {
    players,
    teamA,
    teamB,
    deletePlayer,
    changePlayer,
    ...store,
  };
};

export default usePlayers;
