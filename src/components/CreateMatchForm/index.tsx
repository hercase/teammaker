"use client";

import { FC, useEffect } from "react";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { shuffle } from "lodash";
import { MatchInputs } from "@/types";
import { useMatchStore } from "@/store";
import { DEFAULT_KIT } from "@/utils/kit";
import { DEFAULT_CAPACITY, splitRoster } from "@/utils";
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
  const { organizer, prefersRandom, location, date, kit, price, capacity, setMatch, remember } = useMatchStore();
  const { startMatch } = usePlayers();

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
    defaultValues: {
      organizer,
      location,
      // The switch opens the way the group usually plays, not the way the last match was rescued.
      random: prefersRandom,
      kit: kit ?? DEFAULT_KIT,
      date: proposeKickoff(date),
      price,
      capacity: capacity ?? DEFAULT_CAPACITY,
    },
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
  const typedCapacity = watch("capacity");

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
      prefersRandom: chosenRandom,
      price: typedPrice,
      capacity: typedCapacity,
    });
  }, [typedName, typedLocation, chosenKit, chosenRandom, typedPrice, typedCapacity, remember]);

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    const { players, substitutes } = splitRoster(data.list, data.capacity);

    if (players.length < 2) return;

    setMatch({
      location: data.location,
      date: data.date,
      organizer: data.organizer,
      random: data.random,
      kit: data.kit,
      price: data.price,
      capacity: data.capacity,
    });
    startMatch(data.random ? shuffle(players) : players, substitutes);
  };

  return (
    <form
      /*
        The list across the top, the rest in two columns under it, and the kit alone on the right.

        Side-by-side columns were tried three ways before this one, and the measurements are the
        argument. The box alone against seven controls: 384 against 900. Moving the two blocks that
        talk about the list over to the box: 785 against 408, the same problem mirrored. Splitting
        the settings evenly under the box: 33 apart at rest, but picking Colores opened fourteen
        shirts and grew the page 65px, which is the jump you feel rather than see. Giving the kit
        the full width stopped the jump and stranded seven shirts across 900px.

        What works is putting everything except the kit on the left, so the left column is the
        taller one — 442 against 287 — and the gap beside the kit is not a hole but the room Colores
        opens into. The page height does not change at all when the mode changes.

        Related fields may share a row: the research that says a single column is completed some 15
        seconds faster allows exactly that exception, and Cupo/Precio is the one pair that qualifies.
        On a phone every column becomes one and the reading order is the one the form always had.
      */
      className="grid w-full max-w-md gap-5 md:max-w-3xl lg:max-w-4xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/*
        Present for the accessibility tree, absent from the screen. This page had no heading at all,
        so a screen reader landed on a textarea with no idea what it had opened — but the app is one
        page with its name already in the header, and a visible "Armar los equipos" above the form
        was a title telling you what the only screen does.
      */}
      <h1 className="sr-only">Armar los equipos</h1>

      {/* The list gets the full width: it is the one element that can use it, so a long name
          prints instead of wrapping. */}
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

      {/* md:items-start so a short column does not stretch to the tall one and hide the seam. */}
      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="flex min-w-0 flex-col gap-5">
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

          {/*
            The two optional numbers share a row. They are the only fields alike enough to pair —
            both short, both numeric, both things you may well skip — and side by side they read as
            one question about the match rather than two more things being asked of you. It buys back
            a field's worth of height on a phone, which is where the form is longest.

            Nothing else pairs: Lugar takes a whole address, and the date wheel needs its width.
          */}
          <div className="grid grid-cols-2 gap-3">
            {/* Optional. Past it, the names on the list are substitutes, in the order they signed up. */}
            <TextInput
              name="capacity"
              label="Cupo"
              inputMode="numeric"
              required={false}
              valueAs={parsePrice}
              value={typedCapacity == null || Number.isNaN(typedCapacity) ? "" : String(typedCapacity)}
              register={register}
            />

            {/* Optional. The picture divides it by whoever plays, which is the message that otherwise
                follows the teams in the group by hand. */}
            <TextInput
              name="price"
              label="Precio de la cancha"
              prefix="$"
              inputMode="numeric"
              required={false}
              valueAs={parsePrice}
              value={typedPrice == null || Number.isNaN(typedPrice) ? "" : String(typedPrice)}
              register={register}
            />
          </div>

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
        </div>

        {/*
          The kit on its own. It is the one block that changes size — Colores opens fourteen shirts
          under it — and a column is the place where that costs nothing: it has the room, and the
          column beside it does not move. Given the full width instead, the seven shirts were
          stranded across 900px with the gaps doing all the talking.

          No defaultValue on the Controller: like the switch, it would win over the form's own
          defaultValues and throw away the kit the last match was saved with.
        */}
        <div className="flex min-w-0 flex-col gap-5">
          <Controller
            name="kit"
            control={control}
            render={({ field }) => <KitSelector value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Crear equipos
      </Button>
    </form>
  );
};

export default CreateMatchForm;
