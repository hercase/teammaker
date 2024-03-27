"use client";

import React, { FC } from "react";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useMatchStore } from "@/store";
import { generatePlayers } from "@/utils";
import { shuffle } from "lodash";
import { MatchFields, MatchInputs, Person, SanityFields } from "@/types";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import DateInput from "@/components/DateInput";
import ListInput from "@/components/ListInput";
import TextInput from "@/components/TextInput";
import { createMatch } from "@/services/match";
import { useRouter } from "next/navigation";

interface CreateMatchFormProps {
  organizer: Person & SanityFields;
}

const CreateMatchForm: FC<CreateMatchFormProps> = ({ organizer }) => {
  const router = useRouter();
  const { random, location } = useMatchStore();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<MatchInputs>({
    mode: "onBlur",
    defaultValues: { location, random },
  });

  const onSubmit: SubmitHandler<MatchInputs> = async (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    const players = data.random ? shuffle(names) : names;
    const lineup = players.map((player) => player._key);

    const match: MatchFields = {
      lineup,
      players,
      history: [],
      location: data.location,
      date: data.date,
      random: data.random,
      colors: { teamA: "#e3e3e3", teamB: "#151d65" },
      maxPlayers: players.length,
    };

    const response = await createMatch({
      ...match,
      organizer: {
        _ref: organizer?._id,
        _type: organizer?._type,
      },
    });

    if (response) {
      router.push(`/match/${response._id}`);
    }
  };

  return (
    <form className="flex flex-col p-5 gap-3 mx-auto w-full h-full" onSubmit={handleSubmit(onSubmit)}>
      <ListInput register={register} error={!!errors.list} onPaste={(clipText) => setValue("list", clipText)} />
      <div className="grid grid-cols-1 gap-2 mb-4">
        <TextInput name="location" label="Lugar" error={!!errors.location} register={register} />
        <div className="flex gap-2">
          <DateInput register={register} error={!!errors.date} />
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

export default CreateMatchForm;
