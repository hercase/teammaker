"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { matchStore } from "@/store";
import { ClipboardIcon } from "@/components/Icons";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";
import { generatePlayers } from "@/helpers";
import { shuffle } from "lodash";
import { MatchInputs } from "@/types";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import classNames from "classnames";

const Create = () => {
  const router = useRouter();
  const { setMatch, teamA, setTeamA, teamB, setTeamB } = matchStore();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<MatchInputs>({
    mode: "onBlur",
  });

  const totalPlayers = teamA.players.length + teamB.players.length;

  useEffect(() => {
    if (totalPlayers > 0) router.push("/match");
  }, [totalPlayers, router]);

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      if (clipText) setValue("list", clipText);
    });

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    setMatch({ location: data.location, date: data.date, creator: data.creator, random: data.random });

    const players = data.random ? shuffle(names) : names;

    const half = Math.ceil(players?.length / 2);

    const firstHalf = players?.slice(0, half);
    const secondHalf = players?.slice(-half);

    setTeamA({ ...teamA, players: firstHalf });
    setTeamB({ ...teamB, players: secondHalf });
  };

  return (
    <form className="flex flex-col p-5 gap-3 mx-auto w-full h-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
        <textarea
          className={classNames("p-4 w-full flex-1 rounded-md resize-none text-gray-700 outline-none", {
            "text-red-600 ring-1 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
              !!errors.list,
          })}
          placeholder={`1. Pedro\n2. Flor\n3. Juan \n4. Sylvie\n5. Chloe ...`}
          {...register("list", { required: true })}
        />
        <Button
          type="button"
          variant="secondary"
          className="absolute bottom-5 right-5 w-12"
          onClick={() => handlePaste()}
        >
          <ClipboardIcon />
        </Button>
      </div>
      <p className="text-white font-sans">Datos del partido</p>
      <div className="grid grid-cols-1 gap-2 mb-4">
        <Input label="Lugar" error={!!errors.location} {...register("location", { required: true })} />
        <Input label="Creador" error={!!errors.creator} {...register("creator", { required: true })} />
        <div className="flex gap-2">
          <DatePicker error={!!errors.date} {...register("date", { required: true })} />
          <div className="flex flex-col">
            <span className="label">Aleatorio</span>
            <div className="flex justify-center items-center mt-1 h-full">
              <Controller
                name="random"
                control={control}
                defaultValue={false}
                render={({ field }) => <ToggleSwitch checked={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <Button type="submit">Crear equipos</Button>
      </div>
    </form>
  );
};

export default Create;
