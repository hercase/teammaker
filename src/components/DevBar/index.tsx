"use client";

import { FC, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { ChevronDownIcon, WrenchScrewdriverIcon } from "@heroicons/react/20/solid";
import { useMatchStore, usePlayersStore } from "@/store";
import { generatePlayers } from "@/utils";
import {
  DUPLICATE_NAMES_LIST,
  expiredDate,
  nextWednesdayAt,
  ODD_LIST,
  USUAL_LIST,
  USUAL_LOCATION,
  USUAL_ORGANIZER,
} from "@/fixtures";

interface DevActionProps {
  children: ReactNode;
  onClick: () => void;
}

const DevAction: FC<DevActionProps> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-11 items-center rounded-sm border border-amber-400/30 bg-amber-400/10 px-3 text-left text-xs text-amber-100 transition-colors hover:bg-amber-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
  >
    {children}
  </button>
);

const DevBar = () => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { setMatch } = useMatchStore();
  const { setPlayers } = usePlayersStore();

  const loadList = (list: string, date: string) => {
    setMatch({ location: USUAL_LOCATION, organizer: USUAL_ORGANIZER, date, random: false });
    setPlayers(generatePlayers(list));
    router.push("/match");
  };

  // Wiping the persisted stores and reloading is the only reset that leaves no stale state behind.
  const resetEverything = () => {
    usePlayersStore.persist.clearStorage();
    useMatchStore.persist.clearStorage();
    window.location.href = "/";
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="flex w-56 flex-col gap-1 rounded-md border border-amber-400/30 bg-gray-900/95 p-2 shadow-lg backdrop-blur-sm">
          <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/70">Solo en dev</p>
          <DevAction onClick={() => loadList(USUAL_LIST, nextWednesdayAt())}>Lista habitual (12)</DevAction>
          <DevAction onClick={() => loadList(ODD_LIST, nextWednesdayAt())}>Lista impar (11)</DevAction>
          <DevAction onClick={() => loadList(DUPLICATE_NAMES_LIST, nextWednesdayAt())}>Nombres repetidos</DevAction>
          <DevAction onClick={() => loadList(USUAL_LIST, expiredDate())}>Partido vencido</DevAction>
          <DevAction onClick={() => router.push("/match")}>Ir a /match</DevAction>
          <DevAction onClick={resetEverything}>Resetear todo</DevAction>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Cerrar la barra de desarrollo" : "Abrir la barra de desarrollo"}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/40 bg-gray-900/95 text-amber-300 shadow-lg transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <ChevronDownIcon className={classNames("h-5 w-5", { hidden: !isOpen })} aria-hidden="true" />
        <WrenchScrewdriverIcon className={classNames("h-5 w-5", { hidden: isOpen })} aria-hidden="true" />
      </button>
    </div>
  );
};

export default DevBar;
