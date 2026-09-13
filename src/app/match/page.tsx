"use client";

import { useEffect } from "react";
import { useMatchStore, useUiStore } from "@/store";
import { ShareIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import EditModal from "@/components/EditModal";
import MatchSummary from "@/components/MatchSummary";
import ShareCard from "@/components/ShareCard";
import Spinner from "@/components/Spinner";
import useAlert from "@/hooks/useAlert";
import useShareTeams from "@/hooks/useShareTeams";
import { formatKickoff, matchFileName } from "@/utils/date";
import usePlayers from "@/hooks/usePlayers";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { date, location } = useMatchStore();
  const { players, hasHydrated, resetMatch } = usePlayers();
  const { showEditModal, setShowEditModal } = useUiStore();
  const { ref: shareRef, share, isSharing } = useShareTeams();

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
        <MatchSummary />

        {/*
          Sharing leads, because it is what this screen is for: the teams get posted back to the
          group the moment they exist and again after every substitution. Creating a new list is a
          once-a-week action and steps back to match Editar.
        */}
        <div className="flex w-full flex-col gap-3 border-t border-border pt-6">
          <Button
            className="w-full"
            disabled={isSharing}
            onClick={() =>
              share({
                text: [location, formatKickoff(date)].filter(Boolean).join(" · "),
                name: matchFileName(location, date),
              })
            }
          >
            <ShareIcon className="h-5 w-5" aria-hidden="true" />
            {isSharing ? "Generando imagen…" : "Compartir"}
          </Button>

          <div className="flex w-full gap-3">
            {/* "Nueva lista", not "Crear nueva lista": beside Editar the verb is understood, and
                the longer label wrapped to two lines on a phone. */}
            <Button variant="ghost" className="flex-1" onClick={handleCreateNewList}>
              Nueva lista
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setShowEditModal(true)}>
              Editar
            </Button>
          </div>
        </div>
        <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} />

        {/* Only while the picture is being taken, and never where anyone can see it. */}
        {isSharing && <ShareCard ref={shareRef} />}

      </div>
    </DndProvider>
  );
};

export default Match;
