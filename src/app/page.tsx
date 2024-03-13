"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchStore } from "@/store";
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";
import { generatePlayers } from "@/utils";
import { shuffle } from "lodash";
import { MatchInputs } from "@/types";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import classNames from "classnames";
import Spinner from "@/components/Spinner";
import DateInput from "@/components/DateInput";
import usePlayers from "@/hooks/usePlayers";

const Create = () => {
  const router = useRouter();
  const { organizer, random, location, setMatch } = useMatchStore();
  const { hasHydrated, players, setPlayers } = usePlayers();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<MatchInputs>({
    mode: "onBlur",
    defaultValues: { location, organizer, random },
  });

  useEffect(() => {
    if (hasHydrated && players?.length) {
      router.push("/match");
    }
  }, [hasHydrated, players, router]);

  const handlePaste = () =>
    navigator?.clipboard.readText().then((clipText) => {
      if (clipText) setValue("list", clipText);
    });

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    const players = data.random ? shuffle(names) : names;

    setMatch({ location: data.location, date: data.date, organizer: data.organizer, random: data.random });
    setPlayers(players);
  };

  if (!hasHydrated) return <Spinner />;

  return (
    <form className="flex flex-col p-5 gap-3 mx-auto w-full h-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col flex-auto w-full relative" style={{ maxHeight: "400px" }}>
        <textarea
          className={classNames("p-4 w-full flex-1 rounded-md resize-none text-gray-700 outline-none", {
            "text-red-600 ring-1 ring-inset ring-red-600 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500":
              !!errors.list,
          })}
          placeholder={`1. Pedro\n2. Flor\n3. Juan \n4. Sylvie\n5. Chloe ...`}
          {...register("list", { required: true, validate: (value) => value.split("\n").filter((v) => v).length > 3 })}
        />
        <Button type="button" variant="secondary" className="absolute bottom-5 right-5" onClick={() => handlePaste()}>
          <ClipboardDocumentIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-4">
        <Input label="Lugar" error={!!errors.location} {...register("location", { required: true })} />
        <Input label="Organizador" error={!!errors.organizer} {...register("organizer", { required: true })} />
        <div className="flex gap-2">
          <DateInput error={!!errors.date} {...register("date", { required: true })} />
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
