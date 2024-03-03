"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { matchStore, uiStore } from "@/store";
import { ClipboardIcon } from "@/components/Icons";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";
import { generatePlayers } from "@/helpers";
import { shuffle } from "lodash";

const Create = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { location, setLocation, creator, setCreator, random, setRandom, setDate, teamA, setTeamA, teamB, setTeamB } =
    matchStore();
  const { input, setInput, playersCount } = uiStore();

  const totalPlayers = teamA.players.length + teamB.players.length;

  useEffect(() => {
    if (totalPlayers > 0) router.push("/match");
  }, [totalPlayers, router]);

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      setInput(clipText);
    });

  const handleSubmit = () => {
    const names = generatePlayers(input);

    if (names.length < 2) return;

    const players = random ? shuffle(names) : names;

    const half = Math.ceil(players?.length / 2);

    const firstHalf = players?.slice(0, half);
    const secondHalf = players?.slice(-half);
    setDate(currentDate);
    setTeamA({ ...teamA, players: firstHalf });
    setTeamB({ ...teamB, players: secondHalf });
  };

  return (
    <div className="flex flex-col p-5 gap-3 mx-auto w-full h-full">
      <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
        <textarea
          className="p-4 w-full flex-1 rounded-md resize-none text-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`1. Pedro\n2. Flor\n3. Juan \n4. Sylvie\n5. Chloe ...`}
        />
        <div className="flex gap-x-2 absolute bottom-5 right-5">
          <Button className="w-12" variant="secondary">
            {playersCount}
          </Button>
          <Button className="w-12" onClick={() => handlePaste()}>
            <ClipboardIcon />
          </Button>
        </div>
      </div>
      <p className="text-white font-sans">Datos del partido</p>
      <form className="grid grid-cols-1 gap-2 mb-4">
        <Input label="Lugar" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input label="Creador" value={creator} onChange={(e) => setCreator(e.target.value)} />
        <div className="flex gap-2">
          <DatePicker value={currentDate} onChange={(date) => setCurrentDate(date)} />
          <div className="flex flex-col">
            <span className="label">Aleatorio</span>
            <div className="flex justify-center items-center mt-1 h-full">
              <ToggleSwitch checked={random} onChange={() => setRandom(!random)} />
            </div>
          </div>
        </div>
      </form>

      <div className="flex justify-center w-full">
        <Button disabled={playersCount > 1 ? false : true} onClick={handleSubmit}>
          Crear equipos
        </Button>
      </div>
    </div>
  );
};

export default Create;
