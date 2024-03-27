"use client";

import React, { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchStore, useUiStore } from "@/store";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import { generatePlayers } from "@/utils";
import { shuffle } from "lodash";
import { MatchInputs, MatchType, Person } from "@/types";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import Spinner from "@/components/Spinner";
import DateInput from "@/components/DateInput";
import usePlayers from "@/hooks/usePlayers";
import ListInput from "@/components/ListInput";
import TextInput from "@/components/TextInput";
import useProfile from "@/hooks/useProfile";
import { createMatch } from "@/sanity/queries";

interface CreateMatchFormProps {
  organizer: Person;
}

const CreateMatchForm: FC<CreateMatchFormProps> = ({ organizer }) => {
  const { random, location } = useMatchStore();
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

  const onSubmit: SubmitHandler<MatchInputs> = async (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    const players = data.random ? shuffle(names) : names;

    const match: MatchType = {
      organizer,
      players,
      bench: [],
      history: [],
      location: data.location,
      date: data.date,
      random: data.random,
    };

    await createMatch(match);
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
