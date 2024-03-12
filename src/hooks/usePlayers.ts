import { usePlayersStore } from "@/store";

const usePlayers = () => {
  const { players, ...store } = usePlayersStore();

  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

  return {
    players,
    teamA,
    teamB,
    ...store,
  };
};

export default usePlayers;
