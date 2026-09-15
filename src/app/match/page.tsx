"use client";

import { useEffect } from "react";
import { useMatchStore, useUiStore } from "@/store";
import { ArrowsRightLeftIcon, ShareIcon } from "@heroicons/react/20/solid";
import { ButtonGroup } from "@heroui/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import EditModal from "@/components/EditModal";
import MatchSummary from "@/components/MatchSummary";
import ShareCard from "@/components/ShareCard";
import Spinner from "@/components/Spinner";
import useAlert from "@/hooks/useAlert";
import useShareTeams from "@/hooks/useShareTeams";
import { matchFileName, shareCaption } from "@/utils/date";
import usePlayers from "@/hooks/usePlayers";
import { countPlaying, pricePerPlayer } from "@/utils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Match = () => {
  const router = useRouter();
  const alert = useAlert();
  const { date, location, price } = useMatchStore();
  const { players, hasHydrated, resetMatch, shuffleTeams } = usePlayers();
  const { showEditModal, setShowEditModal } = useUiStore();
  const { ref: shareRef, share, isSharing } = useShareTeams();

  const perHead = pricePerPlayer(price, countPlaying(players ?? []));

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
          Three weights, top to bottom, and each one is a different *kind* of fill rather than the
          same fill at a different brightness:

            Compartir          primary   violet     what the screen is for
            Mezclar equipos    tertiary  outline    a repair, offered but not urged
            Nueva lista|Editar outline   a pair     housekeeping

          tertiary used to be HeroUI's tertiary, a --default grey slab that read as disabled, then
          HeroUI's ghost, which has no chrome and read as a label. Outline is the same 3:1 edge as
          the pair below — one full-width row rather than two halves. Two violets was the first
          attempt and both buttons came out identical; an unmapped variant name falls through to
          HeroUI's default, which is primary.

          Toolbar was tried around this strip and dropped: its tray ships w-fit + items-start, so
          every button collapsed to the left.
        */}
        <div className="flex w-full flex-col gap-3 border-t border-border pt-6">
          <Button
            className="w-full"
            disabled={isSharing}
            onClick={() =>
              share({
                text: shareCaption(location, date, perHead),
                name: matchFileName(location, date),
              })
            }
          >
            <ShareIcon className="h-5 w-5" aria-hidden="true" />
            {isSharing ? "Generando imagen…" : "Compartir"}
          </Button>

          <Button variant="tertiary" className="w-full" onClick={() => shuffleTeams()}>
            <ArrowsRightLeftIcon className="h-5 w-5" aria-hidden="true" />
            Mezclar equipos
          </Button>

          {/*
            ButtonGroup earns its place here for what it does in CSS: it collapses the two outlines
            into one shared edge, rounds only the outer corners, and hangs the divider off the
            second button — which is where the Separator goes, inside each button but the first.

            What it cannot do here is hand its children anything. ButtonGroup passes size, variant
            and fullWidth through a context that a Button only reads when ButtonGroup has cloned it
            with a private marker prop, and it clones its *direct* children — which is this app's
            Button wrapper, not HeroUI's. So the marker stops at the wrapper and the context never
            arrives. Hence `variant` and `w-full` on each child and not on the group: they look
            redundant beside `fullWidth` and they are the only reason this row is two halves in
            outline rather than two auto-width primaries.
          */}
          <ButtonGroup fullWidth>
            {/* "Nueva lista", not "Crear nueva lista": beside Editar the verb is understood, and
                the longer label wrapped to two lines on a phone. */}
            <Button variant="ghost" className="w-full" onClick={handleCreateNewList}>
              Nueva lista
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowEditModal(true)}>
              <ButtonGroup.Separator />
              Editar
            </Button>
          </ButtonGroup>
        </div>

        <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} />

        {/* Only while the picture is being taken, and never where anyone can see it. */}
        {isSharing && <ShareCard ref={shareRef} />}
      </div>
    </DndProvider>
  );
};

export default Match;
