"use client";

import { useEffect } from "react";
import { useMatchStore, useUiStore } from "@/store";
import PlayersList from "@/components/PlayersList";
import BibIcon from "@/components/Icons/BibIcon";
import { BIB_HEX } from "@/utils/kit";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import EditModal from "@/components/EditModal";
import InfoCard from "@/components/InfoCard";
import Spinner from "@/components/Spinner";
import MatchHistory from "@/components/MatchHistory";
import useAlert from "@/hooks/useAlert";
import usePlayers from "@/hooks/usePlayers";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { kit, date } = useMatchStore();
  const { players, teamA, teamB, hasHydrated, resetMatch } = usePlayers();
  const { showEditModal, setShowEditModal } = useUiStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!players?.length) {
      router.push("/");
    }
  }, [hasHydrated, players, router]);

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
  }, [date, alert, resetMatch, router]);

  const handleCreateNewList = () => {
    resetMatch();
    router.push("/");
  };

  if (!hasHydrated) return <Spinner />;

  return (
    <DndProvider backend={HTML5Backend}>
      {/* min-w-0: this is a flex item, and a flex item is never smaller than its own content
          unless told otherwise. Without it a long name made the whole page scroll sideways on a
          phone instead of being truncated inside its row. */}
      <div className="flex w-full min-w-0 max-w-md flex-col gap-6 lg:max-w-3xl">
        <div className="flex flex-col gap-5">
          <InfoCard />

          <div className="relative flex min-h-[100px] min-w-0 justify-center gap-2 text-center sm:gap-3">
            <PlayersList side="A" kit={kit} players={teamA} />
            <PlayersList side="B" kit={kit} players={teamB} />
          </div>

          {/* One line instead of a label in each header: only one team wears anything. */}
          {kit.mode === "bibs" && (
            <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
              <BibIcon color={BIB_HEX} size={18} aria-hidden="true" />
              El equipo {kit.bibTeam} juega con pecheras
            </p>
          )}

          <MatchHistory />
        </div>
        <div className="flex w-full gap-3 border-t border-border pt-6">
          <Button className="flex-1" onClick={handleCreateNewList}>
            Crear nueva lista
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => setShowEditModal(true)}>
            Editar
          </Button>
        </div>
        <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} />
      </div>
    </DndProvider>
  );
};

export default Match;
