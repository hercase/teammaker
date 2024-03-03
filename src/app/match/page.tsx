"use client";

import { useEffect } from "react";
import { matchStore, uiStore } from "@/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PlayersList from "@/components/PlayersList";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { VersusIcon } from "@/components/Icons";
import EditPlayerModal from "@/components/EditPlayerModal";

const ListTeam = () => {
  const router = useRouter();
  const { date, location, creator, random, teamA, setTeamA, setTeamB, teamB, resetMatch } = matchStore();

  const { showEditPlayerModal, setShowEditPlayerModal } = uiStore();

  const totalPlayers = teamA.players?.length + teamB.players?.length;

  useEffect(() => {
    if (totalPlayers <= 0) router.push("/");
  }, [totalPlayers, router]);

  const handleCreateNewList = () => {
    resetMatch();
    router.push("/");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="screenshot flex flex-col gap-5 p-4">
        <div className="col-span-1 flex shadow-sm rounded-md w-full mx-auto">
          <div className="flex-shrink-0 flex items-center justify-center w-16 bg-purple-600 text-white text-sm font-medium rounded-l-md">
            <svg width={30} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
            <div className="flex-1 px-4 py-2 text-sm truncate">
              <p className="text-gray-900 font-medium hover:text-gray-600">{location}</p>
              <p className="text-gray-500 capitalize">{format(date, "EEEE dd/MM - p", { locale: es })} hs </p>
              <p className="text-gray-500">Creado por {creator}</p>
              <p className="text-gray-500">{totalPlayers} Jugadores</p>
              {random && <p className="text-gray-500">Lista aleatoria 🎲</p>}
            </div>
          </div>
        </div>

        <div style={{ minHeight: "100px" }} className="relative flex justify-center mb-5 text-center gap-3">
          <PlayersList
            shirtPosition="right"
            players={teamA.players}
            color={teamA.color}
            setColor={(color) => setTeamA({ ...teamA, color })}
          />

          <VersusIcon className="z-10 absolute top-10" />

          <PlayersList
            shirtPosition="left"
            players={teamB.players}
            color={teamB.color}
            setColor={(color) => setTeamB({ ...teamB, color })}
          />
        </div>
      </div>
      <div className="flex justify-center w-full gap-4">
        <Button onClick={handleCreateNewList}>Crear nueva lista</Button>
        <Button variant="danger" onClick={() => setShowEditPlayerModal(true)}>
          Reemplazar jugador
        </Button>
      </div>
      <EditPlayerModal isOpen={showEditPlayerModal} setIsOpen={setShowEditPlayerModal} />
    </div>
  );
};

export default ListTeam;
