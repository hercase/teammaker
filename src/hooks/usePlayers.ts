import { usePlayersStore } from "@/store";
import { Player, TeamSide } from "@/types";
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
    restorePlayer,
    promoteSubstitute,
    addPlayer: _addPlayer,
    addSubstitute,
    ...store
  } = usePlayersStore();

  const waiting = substitutes ?? [];

  const { teamA, teamB } = splitTeams(players ?? []);

  /*
    Collisions are decided on what is actually drawn, so a substitute counts, not the player it
    replaced — and they are numbered by arrival, not by row. A substitute takes the row of whoever
    left, which may sit above the original; numbering down the rows made the newcomer "Keis (1)"
    and the Keis who signed up first "Keis (2)". The bench is in the order people came in.
  */
  const shownOf = (player: Player) => bench?.find((p) => p.id === player.isReplacedBy) ?? player;
  const drawn = (players ?? []).map(shownOf);
  const arrival = [
    ...drawn.filter((p) => !bench?.some((b) => b.id === p.id)),
    ...(bench ?? []).filter((b) => drawn.some((p) => p.id === b.id)),
  ];
  const tags = duplicateTags(arrival.map((p) => ({ id: p.id, label: `${p.name} ${p.details ?? ""}`.trim() })));

  /*
    Someone who takes a substitute's place is not "given up": the row goes straight from one name
    to the other and the history says "reemplazado por". So when the waiting list has anyone on
    it, a drop-out asks who comes in, with "Nadie" as one of the answers — the two-step version
    left the screen saying "falta uno" between the taps and wrote two events for one fact.
  */
  const enters = (player: Player, user: string) => {
    if (!user.trim()) return _removePlayer(player.id);

    const substitute = waiting.find((sub) => generateFullName(sub).trim() === user.trim());

    if (substitute) return promoteSubstitute(player.id, substitute.id);

    _replacePlayer(player.id, user);
  };

  const removePlayer = (player: Player) => {
    const name = shownOf(player).name;

    if (waiting.length === 0) {
      return alert({
        text: `¿Estás seguro que deseas dar de baja a ${name}?`,
        cb: () => _removePlayer(player.id),
      });
    }

    alert({
      text: `${name} se baja. ¿Quién entra?`,
      input: "text",
      inputValidator: validateName,
      choices: waiting.map((sub) => generateFullName(sub).trim()),
      emptyLabel: "Nadie, queda afuera",
      cb: (user: string) => enters(player, user),
    });
  };

  /*
    The substitutes are offered by name; picking one is the same as typing it, and a typed name
    that is a substitute's is the substitute stepping in — off the waiting list, not a second
    person who happens to share the name.
  */
  const replacePlayer = (player: Player) => {
    alert({
      text: `¿Quién entra por ${shownOf(player).name}?`,
      input: "text",
      inputValidator: validateName,
      choices: waiting.map((sub) => generateFullName(sub).trim()),
      cb: (user: string) => enters(player, user),
    });
  };

  /*
    The eleventh player's missing partner, or the two the cap still has room for — or the undo of a
    drop-out: whoever left this side is offered first, by the name their row showed, and picking
    them brings the row back rather than adding a second one. Then the waiting list, then a name.
  */
  const addPlayer = (side: TeamSide, teamLabel: string, team: Player[]) => {
    // "a Oscuras", "a Azul", but "al equipo B": the label is a name in two modes and a noun in one.
    const where = /^Equipo\b/.test(teamLabel) ? `al ${teamLabel.toLowerCase()}` : `a ${teamLabel}`;
    const dropped = team.filter((p) => p.isDeleted).map((p) => ({ row: p, name: generateFullName(shownOf(p)).trim() }));

    alert({
      text: `¿Quién se suma ${where}?`,
      input: "text",
      inputValidator: validateName,
      choices: [...dropped.map((d) => d.name), ...waiting.map((sub) => generateFullName(sub).trim())],
      cb: (user: string) => {
        const back = dropped.find((d) => d.name === user.trim());

        if (back) return restorePlayer(back.row.id);

        const substitute = waiting.find((sub) => generateFullName(sub).trim() === user.trim());

        if (substitute) return addSubstitute(substitute.id, side);

        _addPlayer(user, side);
      },
    });
  };

  const renamePlayer = (player: Player) => {
    alert({
      text: `Ingresa el nuevo nombre para ${shownOf(player).name}`,
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
    addPlayer,
    ...store,
  };
};

export default usePlayers;
