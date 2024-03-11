import { useMatchStore } from "@/store";
import { Player } from "@/types";

const usePlayers = (players: Player[]) => {
  const { substitutes, replacements } = useMatchStore();

  const newList = players.map((player) => {
    const replacement = replacements?.find((replace) => replace.old === player.id);

    console.log("🚀 ~ replacement:", replacement);

    const susbstitute = substitutes?.find((sub) => sub.id === replacement?.new);

    console.log("🚀 ~ susbstitute:", substitutes);

    if (replacement?.old) return { ...player, name: "--", details: "" };

    if (replacement?.new) return susbstitute;

    return player;
  });

  return newList;
};
export default usePlayers;
