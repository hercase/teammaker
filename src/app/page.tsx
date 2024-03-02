"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { shuffle } from "lodash";
import { matchStore } from "@/store";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Players } from "@/types";
import { ClipboardIcon } from "@/components/Icons";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";

const Create = () => {
  const { location, setLocation, players, setPlayers, creator, random, setRandom } = matchStore();

  console.log("🚀 ~ players:", players);

  const [persistLocation, setPersistLocation] = useLocalStorage("match-location", location);
  const [persistCreator, setPersistCreator] = useLocalStorage("creator", creator);
  const [value, setValue] = useState("");
  const router = useRouter();

  const handlePaste = () => {
    // eslint-disable-next-line no-unused-expressions
    navigator?.clipboard.readText().then((clipText) => {
      handlePlayers(clipText);
    });
  };

  const CreateTeams = () => {
    const playersList = random ? shuffle(players) : players;

    setPlayers(playersList);
    setLocation(persistLocation);
    if (players) router.push("/list");
  };

  const handlePlayers = (text: string) => {
    const players = text.split("\n") as Players;
    setPlayers(players);
    setValue(text);
  };

  return (
    <div className="flex flex-col p-5 gap-3 max-w-screen-xl mx-auto w-full h-full">
      <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
        <textarea
          className="p-4 w-full flex-1 rounded-md resize-none"
          onChange={(e) => handlePlayers(e.target.value)}
          value={value}
          placeholder={`1. Pedro\n2. Flor\n3. Juan \n4. Sylvie\n5. Chloe ...`}
        />
        <div className="flex gap-x-2 absolute bottom-5 right-5">
          <Button className="w-12" variant="secondary">
            {players.length}
          </Button>
          <Button className="w-12" onClick={() => handlePaste()}>
            <ClipboardIcon />
          </Button>
        </div>
      </div>
      <p className="text-white font-sans">Datos del partido</p>
      <form className="grid grid-cols-1 gap-2 mb-4">
        <Input label="Lugar" value={persistLocation} onChange={(e) => setPersistLocation(e.target.value)} />
        <Input label="Creador" value={persistCreator} onChange={(e) => setPersistCreator(e.target.value)} />
        <div className="flex gap-2">
          <DatePicker />
          <div className="flex flex-col">
            <span className="block text-sm font-medium text-gray-700 mb-2">Aleatorio</span>
            <div className="flex h-full">
              <ToggleSwitch
                title="Crear lista de manera aleatoria"
                size="sm"
                value={random}
                checked={random}
                onChange={() => {
                  setRandom(!random);
                  handlePlayers(value);
                }}
              />
            </div>
          </div>
        </div>
      </form>

      <div className="flex justify-center w-full">
        <Button disabled={players.length > 1 ? false : true} onClick={() => CreateTeams()}>
          Crear equipos
        </Button>
      </div>
    </div>
  );
};

export default Create;
