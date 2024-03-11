"use client";

import { useEffect } from "react";
import { useMatchStore, useUiStore } from "@/store";
import PlayersList from "@/components/PlayersList";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { VersusIcon } from "@/components/Icons";
import EditModal from "@/components/EditModal";
import InfoCard from "@/components/InfoCard";
import Spinner from "@/components/Spinner";
import MatchHistory from "@/components/MatchHistory";
import { generatePlayer } from "@/utils";

const Match = () => {
  generatePlayer("Lele (Pelado)");
  const router = useRouter();
  const { hasHydrated, players, resetMatch, colors } = useMatchStore();
  const { showEditModal, setShowEditModal } = useUiStore();

  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

  useEffect(() => {
    if (hasHydrated && !players?.length) {
      router.push("/");
    }
  }, [hasHydrated, players, router]);

  const handleCreateNewList = () => {
    resetMatch();
    router.push("/");
  };

  if (!hasHydrated) return <Spinner />;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-5 p-4">
        <InfoCard />

        <div className="relative flex justify-center text-center gap-3 min-h-[100px]">
          <PlayersList shirtPosition="right" players={teamA} color={colors.teamA} />
          <VersusIcon className="z-10 absolute top-10" />
          <PlayersList shirtPosition="left" players={teamB} color={colors.teamB} />
        </div>

        <MatchHistory />
      </div>
      <div className="flex justify-center w-full gap-4 mt-4">
        <Button onClick={handleCreateNewList}>Crear nueva lista</Button>
        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
          Editar
        </Button>
      </div>
      <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} />
    </div>
  );
};

export default Match;
