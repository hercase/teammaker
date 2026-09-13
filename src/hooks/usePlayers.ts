import { usePlayersStore } from "@/store";
import { Player } from "@/types";
import useAlert from "@/hooks/useAlert";
import { duplicateTags, splitTeams, validateName } from "@/utils";

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

  const { teamA, teamB } = splitTeams(players ?? []);

  // Collisions are decided on what is actually drawn, so a substitute counts, not the player it replaced.
  const shown = (players ?? []).map((player) => bench?.find((p) => p.id === player.isReplacedBy) ?? player);
  const tags = duplicateTags(shown.map((p) => ({ id: p.id, label: `${p.name} ${p.details ?? ""}`.trim() })));

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
    teamA,
    teamB,
    tags,
    removePlayer,
    replacePlayer,
    renamePlayer,
    ...store,
  };
};

export default usePlayers;
