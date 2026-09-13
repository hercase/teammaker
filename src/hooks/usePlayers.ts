import { usePlayersStore } from "@/store";
import { Player } from "@/types";
import useAlert from "@/hooks/useAlert";
import { duplicateTags, generateFullName, splitTeams, validateName } from "@/utils";

const usePlayers = () => {
  const alert = useAlert();
  const {
    players,
    bench,
    substitutes,
    removePlayer: _removePlayer,
    replacePlayer: _replacePlayer,
    renamePlayer: _renamePlayer,
    promoteSubstitute,
    ...store
  } = usePlayersStore();

  const waiting = substitutes ?? [];

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

  /*
    The substitutes are offered by name; picking one is the same as typing it, and a typed name
    that is a substitute's is the substitute stepping in — off the waiting list, not a second
    person who happens to share the name.
  */
  const replacePlayer = (player: Player) => {
    alert({
      text: `¿Quién entra por ${player.name}?`,
      input: "text",
      inputValidator: validateName,
      choices: waiting.map((sub) => generateFullName(sub).trim()),
      cb: (user: string) => {
        const substitute = waiting.find((sub) => generateFullName(sub).trim() === user.trim());

        if (substitute) return promoteSubstitute(player.id, substitute.id);

        _replacePlayer(player.id, user);
      },
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
    substitutes: waiting,
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
