"use client";

import { FC, useEffect } from "react";
import { useMatchStore } from "@/store";
import { MatchInputs } from "@/types";
import { Modal, Separator } from "@heroui/react";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import KitSelector from "@/components/KitSelector";
import usePlayers from "@/hooks/usePlayers";
import DateInput from "@/components/DateInput";
import TextInput from "@/components/TextInput";
import { parsePrice } from "@/utils";

interface EditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ isOpen, setIsOpen }) => {
  const { organizer, location, date, kit, random, price, capacity, setMatch } = useMatchStore();
  const { shuffleTeams } = usePlayers();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MatchInputs>({
    /*
      onTouched, not onBlur: both check the field when you first leave it, but onBlur only checks
      again on the next blur, so a field stays red while you are fixing it. onTouched re-checks on
      every keystroke once the field has been visited.
    */
    mode: "onTouched",
    defaultValues: { organizer, location, kit, date, random, price, capacity },
  });

  /*
    The dialog never unmounts, so useForm keeps whatever was last typed into it. Without this,
    Cancelar only hid the form: the abandoned values were still there on the next Editar, and were
    written to the store by the next Confirmar. Reopening now always starts from the saved match.
  */
  useEffect(() => {
    if (isOpen) reset({ organizer, location, kit, date, random, price, capacity });
  }, [isOpen, reset, organizer, location, kit, date, random, price, capacity]);

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    setMatch({
      organizer: data.organizer,
      location: data.location,
      date: data.date,
      // Not data.random: how the teams were built is not something an edit gets to rewrite.
      random,
      kit: data.kit,
      price: data.price,
      capacity: data.capacity,
    });

    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md">
            <Modal.Header>
              <Modal.Heading>Editar</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form className="flex flex-col gap-6 mt-4" onSubmit={handleSubmit(onSubmit)}>
                {/*
                    value on all three, or the dialog opens empty: React Aria initialises each field
                    with its own state and overwrites what reset() had just put there. See TextInput.
                  */}
                <TextInput
                  name="organizer"
                  label="Organizador"
                  error={!!errors.organizer}
                  value={watch("organizer")}
                  register={register}
                />

                <TextInput
                  name="location"
                  label="Lugar"
                  error={!!errors.location}
                  value={watch("location")}
                  register={register}
                />
                {/*
                    No future check here. Editing is also what you do ten minutes before kick-off,
                    when someone drops out — and a match starting in under fifteen minutes would
                    have failed a rule meant for creating one, making the location unfixable.
                  */}
                <DateInput register={register} error={!!errors.date} value={watch("date")} requireFuture={false} />

                <TextInput
                  name="capacity"
                  label="Cupo de jugadores"
                  inputMode="numeric"
                  required={false}
                  valueAs={parsePrice}
                  value={watch("capacity") == null ? "" : String(watch("capacity"))}
                  register={register}
                />

                <TextInput
                  name="price"
                  label="Precio de la cancha"
                  prefix="$"
                  inputMode="numeric"
                  required={false}
                  valueAs={parsePrice}
                  value={watch("price") == null ? "" : String(watch("price"))}
                  register={register}
                />

                <Controller
                  name="kit"
                  control={control}
                  render={({ field }) => <KitSelector value={field.value} onChange={field.onChange} />}
                />
                {/*
                  The draw is still not a switch, and that is the point of it.

                  It says the teams were not arranged by anyone, which is a claim made to the group
                  about something that already happened. This used to be a switch that could be
                  turned off, and turning it off re-enabled dragging: draw the teams, edit, flip the
                  switch, rearrange — the promise laundered in three taps.

                  Dealing them again is the one move that changes the sides without touching the
                  claim: nobody picked them before and nobody picks them now, and the history says
                  out loud that it happened. So the claim is not editable and the deal is an action,
                  which is why this is a button and not a field — it lives below the separator, with
                  Confirmar and Cancelar, rather than among the things you are filling in.
                */}
                <Separator className="bg-border-strong/60" />

                <div className="flex flex-col gap-2">
                  {/*
                    The dialog opens over this one and closes it only on Confirmar: cancelling has
                    to leave the form exactly as it was, half-typed edits included.
                  */}
                  <Button variant="ghost" className="w-full" onClick={() => shuffleTeams(() => setIsOpen(false))}>
                    <ArrowsRightLeftIcon className="h-5 w-5" aria-hidden="true" />
                    Mezclar equipos
                  </Button>

                  <p className="text-xs text-text-muted">
                    {random
                      ? "Los equipos están sorteados al azar, por eso no se pueden reordenar a mano."
                      : "Al mezclar, los equipos pasan a estar sorteados al azar y dejan de poder reordenarse a mano."}
                  </p>
                </div>

                {/* Same two-button row as every other dialog: the confirm is the primary action. */}
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    Confirmar
                  </Button>
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default EditModal;
