"use client";

import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import { ChevronDownIcon, WrenchScrewdriverIcon } from "@heroicons/react/20/solid";
import { Separator } from "@heroui/react";
import { useMatchStore, usePlayersStore } from "@/store";
import { shuffle } from "lodash";
import { generatePlayers } from "@/utils";
import { DEFAULT_KIT } from "@/utils/kit";
import { Kit } from "@/types";
import {
  DUPLICATE_NAMES_LIST,
  expiredDate,
  nextWednesdayAt,
  ODD_LIST,
  USUAL_LIST,
  USUAL_LOCATION,
  USUAL_ORGANIZER,
  USUAL_PRICE,
} from "@/fixtures";

interface DevActionProps {
  children: ReactNode;
  onClick: () => void;
}

// What the group of actions underneath it is for, so the bar reads as sections rather than a pile.
const DevLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="px-2.5 pb-0.5 pt-1 text-xs uppercase tracking-wide text-amber-300/70">{children}</span>
);

const DevAction: FC<DevActionProps> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-10 items-center rounded px-2.5 text-left text-sm text-amber-100 transition-colors hover:bg-amber-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
  >
    {children}
  </button>
);

interface LoadOptions {
  list?: string;
  date?: string;
  kit?: Kit;
  random?: boolean;
}

const DevBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const { setMatch } = useMatchStore();
  const { setPlayers } = usePlayersStore();
  const barRef = useRef<HTMLDivElement>(null);
  const isOnForm = pathname === "/";

  /*
    Dismissed the way every other menu here is: tap anywhere else, or press Escape. The ref is on
    the wrapper rather than the panel so that a tap on the toggle is "inside" and closes it once,
    through its own onClick, instead of twice.
  */
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const loadList = ({
    list = USUAL_LIST,
    date = nextWednesdayAt(),
    kit = DEFAULT_KIT,
    random = false,
  }: LoadOptions = {}) => {
    const players = generatePlayers(list);

    setMatch({ location: USUAL_LOCATION, organizer: USUAL_ORGANIZER, date, random, kit, price: USUAL_PRICE });
    setPlayers(random ? shuffle(players) : players);
    router.push("/match");

    return players;
  };

  /*
    Fills the form in place instead of creating anything, for working on the form itself. It writes
    through the native value setter and fires an input event, which is how React picks the change
    up: the bar drives the rendered inputs the way a person would, so no dev-only prop or store has
    to exist in the components themselves.

    Offered only on the screen that has a form. It used to be offered everywhere and cope by
    navigating home and retrying after 400ms, which is a guess dressed as a feature.
  */
  const fillForm = () => {
    const type = (selector: string, value: string) => {
      const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);

      if (!field) return false;

      const prototype =
        field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;

      Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));

      return true;
    };

    type("#organizer", USUAL_ORGANIZER);
    type("#location", USUAL_LOCATION);
    type("#date", nextWednesdayAt());
    type("textarea", USUAL_LIST);
  };

  /*
    A match already in progress: one player swapped for a substitute and another dropped out. It is
    the state the app spends most of its life in and the only one the row menu can produce, so
    reaching it by hand meant six taps through two confirm dialogs every time.
  */
  const loadWithSubstitutions = () => {
    const players = loadList({ kit: { mode: "bibs", bibTeam: "A" } });
    const store = usePlayersStore.getState();

    store.replacePlayer(players[2].id, "Nico");
    store.removePlayer(players[8].id);
  };

  // Wiping the persisted stores and reloading is the only reset that leaves no stale state behind.
  const resetEverything = () => {
    usePlayersStore.persist.clearStorage();
    useMatchStore.persist.clearStorage();
    window.location.href = "/";
  };

  return (
    <div ref={barRef} className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-2">
      {isOpen && (
        // A tap on any action is also a dismissal: the state it loads is the thing worth looking at.
        <div
          onClick={() => setOpen(false)}
          className="flex w-60 flex-col gap-1 rounded-md border border-amber-400/40 bg-canvas/95 p-1.5 shadow-lg backdrop-blur-sm"
        >
          {/* Only where there is a form to fill. */}
          {isOnForm && (
            <>
              <DevLabel>Formulario</DevLabel>
              <DevAction onClick={fillForm}>Completar los campos</DevAction>
              <Separator className="my-0.5 bg-amber-400/20" />
            </>
          )}

          {/*
            Named after the case each one puts the app in, not after what happens to be in the list.
            "dos Mati" described the fixture; "nombres repetidos" describes why anyone would load it.
          */}
          <DevLabel>Cargar un partido</DevLabel>
          <DevAction onClick={() => loadList({ kit: { mode: "bibs", bibTeam: "A" } })}>Con pecheras</DevAction>
          <DevAction onClick={() => loadList({ kit: { mode: "shades", lightTeam: "A" } })}>Claras y oscuras</DevAction>
          <DevAction onClick={() => loadList({ kit: { mode: "shirts", teamA: "white", teamB: "blue" } })}>
            Con colores
          </DevAction>
          <DevAction onClick={() => loadList({ random: true })}>Sorteado al azar</DevAction>
          <DevAction onClick={loadWithSubstitutions}>Con un cambio y una baja</DevAction>
          <DevAction onClick={() => loadList({ list: DUPLICATE_NAMES_LIST })}>Con nombres repetidos</DevAction>
          <DevAction onClick={() => loadList({ list: ODD_LIST })}>Con lista impar (11)</DevAction>
          <DevAction onClick={() => loadList({ date: expiredDate() })}>Ya finalizado</DevAction>

          <Separator className="my-0.5 bg-amber-400/20" />

          <DevAction onClick={resetEverything}>Borrar todo y empezar de cero</DevAction>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Cerrar la barra de desarrollo" : "Abrir la barra de desarrollo"}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/40 bg-canvas/95 text-amber-300 shadow-lg transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <ChevronDownIcon className={classNames("h-5 w-5", { hidden: !isOpen })} aria-hidden="true" />
        <WrenchScrewdriverIcon className={classNames("h-5 w-5", { hidden: isOpen })} aria-hidden="true" />
      </button>
    </div>
  );
};

export default DevBar;
