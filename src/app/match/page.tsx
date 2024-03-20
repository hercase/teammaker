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
import usePlayers from "@/hooks/usePlayers";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HandRaisedIcon } from "@heroicons/react/20/solid";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { colors, date, random } = useMatchStore();
  const { players, teamA, teamB, hasHydrated, resetMatch } = usePlayers();
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
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-5 p-4">
          <InfoCard />

          <div className="relative flex justify-center text-center gap-3 min-h-[100px]">
            <PlayersList shirtPosition="right" players={teamA} color={colors.teamA} />
            <VersusIcon className="z-10 absolute top-10" />
            <PlayersList shirtPosition="left" players={teamB} color={colors.teamB} />
          </div>

          {!random && (
            <div className="flex gap-2 items-center text-gray-300">
              <HandRaisedIcon className="w-5 h-5" />
              <p className="text-sm">
                Arrastra los jugadores para ordenar o cambiar de equipo.
              </p>
            </div>
          )}

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
    </DndProvider>
  );
};

export default Match;
