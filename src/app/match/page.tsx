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
import useAlert from "@/hooks/useAlert";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { hasHydrated, players, resetMatch, colors, date } = useMatchStore();
  const { showEditModal, setShowEditModal } = useUiStore();

  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!players?.length) {
      router.push("/");
    }
  }, [hasHydrated, players, router, resetMatch, alert]);

  useEffect(() => {
    const matchIsOld = date && new Date(date) < new Date();

    if (matchIsOld) {
      alert({
        text: "El partido ya ha finalizado, ¿deseas crear una nueva lista?",
        cb: () => {
          resetMatch();
          router.push("/");
        },
      });
    }
  }, [date]);

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
