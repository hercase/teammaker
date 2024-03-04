"use client";

import { useEffect } from "react";
import { matchStore, uiStore } from "@/store";
import PlayersList from "@/components/PlayersList";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { VersusIcon } from "@/components/Icons";
import EditModal from "@/components/EditModal";
import InfoCard from "@/components/InfoCard";

const ListTeam = () => {
  const router = useRouter();
  const { players, resetMatch, colors } = matchStore();

  const { showEditModal, setShowEditModal } = uiStore();

  const totalPlayers = players.length;
  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

  useEffect(() => {
    if (totalPlayers <= 0) router.push("/");
  }, [totalPlayers, router]);

  const handleCreateNewList = () => {
    resetMatch();
    router.push("/");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-5 p-4">
        <InfoCard />

        <div className="relative flex justify-center mb-5 text-center gap-3 min-h-[100px]">
          <PlayersList shirtPosition="right" players={teamA} color={colors.teamA} />
          <VersusIcon className="z-10 absolute top-10" />
          <PlayersList shirtPosition="left" players={teamB} color={colors.teamB} />
        </div>
      </div>
      <div className="flex justify-center w-full gap-4">
        <Button onClick={handleCreateNewList}>Crear nueva lista</Button>
        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
          Editar
        </Button>
      </div>
      <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} />
    </div>
  );
};

export default ListTeam;
