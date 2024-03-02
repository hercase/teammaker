"use client";

import React from "react";
import { matchStore, playersStore } from "@/store";
import { ClipboardIcon } from "@/components/Icons";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";

const Create = () => {
  const { location, setLocation, creator, setCreator, random, setRandom } = matchStore();
  const { input, setInput, players } = playersStore();

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      setInput(clipText);
    });

  return (
    <div className="flex flex-col p-5 gap-3 max-w-screen-xl mx-auto w-full h-full">
      <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
        <textarea
          className="p-4 w-full flex-1 rounded-md resize-none text-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
        <Input label="Lugar" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input label="Creador" value={creator} onChange={(e) => setCreator(e.target.value)} />
        <div className="flex gap-2">
          <DatePicker />
          <div className="flex flex-col">
            <span className="label">Aleatorio</span>
            <div className="flex justify-center items-center mt-1 h-full">
              <ToggleSwitch checked={random} onChange={() => setRandom(!random)} />
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
