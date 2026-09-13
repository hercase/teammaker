"use client";

import { FC, useEffect } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { shuffle } from "lodash";
import { MatchInputs } from "@/types";
import { useMatchStore } from "@/store";
import { DEFAULT_KIT } from "@/utils/kit";
import { generatePlayers } from "@/utils";
import usePlayers from "@/hooks/usePlayers";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import DateInput from "@/components/DateInput";
import ListInput from "@/components/ListInput";
import KitSelector from "@/components/KitSelector";
import TextInput from "@/components/TextInput";

/*
  Its own component so that it mounts only once the stores have rehydrated. useForm reads its
  defaults on the first render and never looks again, so while this lived in the page it captured
  the store as it was before localStorage came back: empty. The name was saved correctly and the
  field still came up blank on every reload.
*/
const CreateMatchForm: FC = () => {
  const { organizer, random, location, kit, setMatch, remember } = useMatchStore();
  const { setPlayers } = usePlayers();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<MatchInputs>({
    /*
      onTouched, not onBlur: both check the field when you first leave it, but onBlur only checks
      again on the next blur, so a field stays red while you are fixing it. onTouched re-checks on
      every keystroke once the field has been visited.
    */
    mode: "onTouched",
    defaultValues: { organizer, location, random, kit: kit ?? DEFAULT_KIT },
  });

  const typedName = watch("organizer");
  const typedLocation = watch("location");

  /*
    These two are remembered as they are typed, not on submit. Someone who writes their name and
    closes the tab before creating anything should not have to write it again.
  */
  useEffect(() => {
    remember({ organizer: typedName, location: typedLocation });
  }, [typedName, typedLocation, remember]);

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    setMatch({
      location: data.location,
      date: data.date,
      organizer: data.organizer,
      random: data.random,
      kit: data.kit,
    });
    setPlayers(data.random ? shuffle(names) : names);
  };

  return (
    <form
      className="grid w-full max-w-md gap-5 md:max-w-(--breakpoint-lg) md:grid-cols-[minmax(0,1fr)_20rem] md:items-stretch lg:grid-cols-[minmax(0,1fr)_24rem]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <ListInput
        register={register}
        error={!!errors.list}
        submitted={isSubmitted}
        value={watch("list")}
        onPaste={(clipText) => setValue("list", clipText, { shouldValidate: true })}
      />

      <div className="flex flex-col gap-5">
        {/*
          This used to be a modal that opened before anything else and asked for a name, which is a
          lot to ask of someone who followed a link from the group and has not seen the app yet. It
          is one more field next to the two it belongs with, and it comes back filled in next time.
        */}
        <TextInput
          name="organizer"
          label="Tu nombre"
          error={!!errors.organizer}
          value={watch("organizer")}
          onClear={() => setValue("organizer", "", { shouldValidate: true })}
          register={register}
        />

        <TextInput
          name="location"
          label="Lugar"
          placeholder="Quintana y Salta"
          error={!!errors.location}
          value={watch("location")}
          onClear={() => setValue("location", "", { shouldValidate: true })}
          register={register}
        />

        <DateInput register={register} error={!!errors.date} />

        {/* No defaultValue: like the switch, it would win over the form's defaultValues and throw
            away the kit the last match was saved with. */}
        <Controller
          name="kit"
          control={control}
          render={({ field }) => <KitSelector value={field.value} onChange={field.onChange} />}
        />

        {/* A labelled row rather than a floating switch: the control and what it does stay together. */}
        <label className="panel flex cursor-pointer items-center justify-between gap-4 p-4">
          <span>
            <span className="block font-medium text-text">Orden aleatorio</span>
            <span className="block text-sm text-text-muted">Mezcla la lista antes de dividir.</span>
          </span>
          <Controller
            name="random"
            control={control}
            render={({ field }) => <ToggleSwitch checked={field.value} onChange={field.onChange} />}
          />
        </label>

        <Button type="submit" className="w-full">
          Crear equipos
        </Button>
      </div>
    </form>
  );
};

export default CreateMatchForm;
