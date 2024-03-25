"use client";

import { useEffect } from "react";
import { useMatchStore, useUiStore } from "@/store";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import EditModal from "@/components/EditModal";
import Spinner from "@/components/Spinner";
import useAlert from "@/hooks/useAlert";
import usePlayers from "@/hooks/usePlayers";

import MatchCard from "@/components/MatchCard";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { date, location, organizer, random, colors } = useMatchStore();
  const { players, bench, history, hasHydrated, resetMatch } = usePlayers();
  const { showEditModal, setShowEditModal } = useUiStore();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleCreateNewList = () => {
    resetMatch();
    router.push("/");
  };

  if (!hasHydrated) return <Spinner />;

  return (
    <div className="flex flex-col w-full">
      <MatchCard
        players={players}
        bench={bench}
        date={date}
        location={location}
        organizer={organizer}
        random={random}
        colors={colors}
        history={history}
      />
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
