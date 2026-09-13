"use client";

import { FC, useEffect } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { shuffle } from "lodash";
import { MatchInputs } from "@/types";
import { useMatchStore } from "@/store";
import { DEFAULT_KIT } from "@/utils/kit";
import { generatePlayers } from "@/utils";
import { parseMessage } from "@/utils/message";
import { proposeKickoff } from "@/utils/date";
import { parsePrice } from "@/utils";
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
  const { organizer, random, location, date, kit, price, setMatch, remember } = useMatchStore();
  const { setPlayers } = usePlayers();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<MatchInputs>({
    /*
      onTouched, not onBlur: both check the field when you first leave it, but onBlur only checks
      again on the next blur, so a field stays red while you are fixing it. onTouched re-checks on
      every keystroke once the field has been visited.
    */
    mode: "onTouched",
    /*
      The date is proposed from the last match — same weekday, same hour, the coming week — because
      the group plays on a schedule and the date wheel is the slowest field on a phone. It is a
      proposal: whatever the pasted message says overrides it, and so does the person.
    */
    defaultValues: { organizer, location, random, kit: kit ?? DEFAULT_KIT, date: proposeKickoff(date), price },
  });

  /*
    A pasted message carries the pitch and the kickoff on the lines that are not players, so they
    fill the fields below instead of being deleted from the box and typed again underneath. Only
    where the field says nothing yet, and never from typing: this is what a paste does, once.
  */
  const fillFromMessage = (text: string) => {
    const message = parseMessage(text);

    if (message.location && !getValues("location")) {
      setValue("location", message.location, { shouldValidate: true, shouldDirty: true });
    }

    if (message.date) setValue("date", message.date, { shouldValidate: true, shouldDirty: true });
  };

  const typedName = watch("organizer");
  const typedLocation = watch("location");
  const chosenKit = watch("kit");
  const chosenRandom = watch("random");
  const typedPrice = watch("price");

  /*
    Remembered as they are chosen, not on submit. Someone who writes their name and closes the tab
    before creating anything should not have to write it again — and the kit and the draw are how
    this group always plays, not a decision to be re-made every week.
  */
  useEffect(() => {
    remember({
      organizer: typedName,
      location: typedLocation,
      kit: chosenKit,
      random: chosenRandom,
      price: typedPrice,
    });
  }, [typedName, typedLocation, chosenKit, chosenRandom, typedPrice, remember]);

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    const names = generatePlayers(data.list);

    if (names.length < 2) return;

    setMatch({
      location: data.location,
      date: data.date,
      organizer: data.organizer,
      random: data.random,
      kit: data.kit,
      price: data.price,
    });
    setPlayers(data.random ? shuffle(names) : names);
  };

  return (
    <form
      className="grid w-full max-w-md gap-5 md:max-w-(--breakpoint-lg) md:grid-cols-[minmax(0,1fr)_20rem] md:items-stretch lg:grid-cols-[minmax(0,1fr)_24rem]"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/*
        Present for the accessibility tree, absent from the screen. This page had no heading at all,
        so a screen reader landed on a textarea with no idea what it had opened — but the app is one
        page with its name already in the header, and a visible "Armar los equipos" above the form
        was a title telling you what the only screen does.
      */}
      <h1 className="sr-only">Armar los equipos</h1>

      <ListInput
        register={register}
        error={!!errors.list}
        submitted={isSubmitted}
        value={watch("list")}
        onPaste={(clipText) => {
          setValue("list", clipText, { shouldValidate: true });
          fillFromMessage(clipText);
        }}
        onPasted={fillFromMessage}
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
          /* Describes what goes in the box, not an example of it. "Quintana y Salta" is where the
             group actually plays, so an empty field looked filled in — and, once marked invalid,
             filled in and rejected at the same time. */
          placeholder="Cancha o dirección"
          error={!!errors.location}
          value={watch("location")}
          onClear={() => setValue("location", "", { shouldValidate: true })}
          register={register}
        />

        <DateInput register={register} error={!!errors.date} value={watch("date")} />

        {/* Optional. The picture divides it by whoever plays, which is the message that otherwise
            follows the teams in the group by hand. */}
        <TextInput
          name="price"
          label="Precio de la cancha"
          inputMode="numeric"
          required={false}
          valueAs={parsePrice}
          value={typedPrice == null || Number.isNaN(typedPrice) ? "" : String(typedPrice)}
          register={register}
        />

        {/* No defaultValue: like the switch, it would win over the form's defaultValues and throw
            away the kit the last match was saved with. */}
        <Controller
          name="kit"
          control={control}
          render={({ field }) => <KitSelector value={field.value} onChange={field.onChange} />}
        />

        {/* The switch carries its own label and explanation; see the note in the component. */}
        <Controller
          name="random"
          control={control}
          render={({ field }) => (
            <ToggleSwitch
              label="Orden aleatorio"
              description="Mezcla la lista antes de dividir."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Button type="submit" className="w-full">
          Crear equipos
        </Button>
      </div>
    </form>
  );
};

export default CreateMatchForm;
