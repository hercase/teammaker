"use client";

import { useEffect, useState } from "react";
import { matchStore, playersStore } from "@/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { shuffle } from "lodash";
import Image from "next/image";
import PlayersList from "@/components/PlayersList";
import { useRouter } from "next/navigation";
import { Player } from "@/types";

const ListTeam = () => {
  const router = useRouter();

  const { date, location, creator, random, colorA, setColorA, colorB, setColorB } = matchStore();
  const { players } = playersStore();
  const [names, setNames] = useState<Player[]>(players);

  const [shuffling, setShuffling] = useState(false);

  const half = Math.ceil(players?.length / 2);

  const firstHalf = names?.slice(0, half);
  const secondHalf = names?.slice(-half);

  useEffect(() => {
    if (shuffling && random) setTimeout(() => setNames(shuffle(names)), 500);
  }, [names, shuffling, random]);

  useEffect(() => {
    if (random) {
      setShuffling(true);
      setTimeout(() => setShuffling(false), 1500);
    }
  }, [random]);

  useEffect(() => {
    if (players.length === 0) {
      router.push("/");
    }
  }, [router, players.length]);

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
              <p className="text-gray-500">{players?.length} Jugadores</p>
              {random && <p className="text-gray-500">Lista aleatoria 🎲</p>}
            </div>
          </div>
        </div>

        <div style={{ minHeight: "100px" }} className="relative flex justify-center mb-5 text-center gap-3">
          <PlayersList players={firstHalf} color={colorA} setColor={setColorA} />
          <div className="z-10 absolute bottom-3">
            <Image alt="Versus icon" src="/img/versus.svg" width={45} height={45} />
          </div>
          <PlayersList players={secondHalf} color={colorB} setColor={setColorB} />
        </div>
      </div>
      <div className="flex justify-center p-4">
        {colorA === colorB && <p>Los colores de los equipos deben ser distintos</p>}
      </div>
    </div>
  );
};

export default ListTeam;
