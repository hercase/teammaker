"use client";

import { FC, useEffect } from "react";
import { useMatchStore } from "@/store";
import { MatchInputs } from "@/types";
import { Modal } from "@heroui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import KitSelector from "@/components/KitSelector";
import DateInput from "@/components/DateInput";
import TextInput from "@/components/TextInput";
import { parsePrice } from "@/utils";

interface EditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ isOpen, setIsOpen }) => {
  const { organizer, location, date, kit, random, price, capacity, setMatch } = useMatchStore();

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

  const typedCapacity = watch("capacity");
  const typedPrice = watch("price");

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <Modal.Backdrop>
        <Modal.Container>
          {/*
            Phone stays max-w-md. From md up, max-w-2xl — a step under the page — with fields in a
            two-column grid and the kit full-width underneath (modes in a row). Side-by-side with
            the kit left a tall empty strip under the short fields; stacking puts every control on
            the width it can use. HeroUI's lg is still only max-w-lg, so the width is ours.
          */}
          <Modal.Dialog className="w-full max-w-md md:max-w-2xl">
            <Modal.Header>
              <Modal.Heading>Editar</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form className="mt-4 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                {/*
                  value on every field, or the dialog opens empty: React Aria initialises each field
                  with its own state and overwrites what reset() had just put there. See TextInput.
                */}
                <div className="grid gap-5 md:grid-cols-2">
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

                    Full row: the datetime wheel needs the width; Cupo and Precio share the next.
                  */}
                  <div className="md:col-span-2">
                    <DateInput register={register} error={!!errors.date} value={watch("date")} requireFuture={false} />
                  </div>

                  <TextInput
                    name="capacity"
                    label="Cupo"
                    inputMode="numeric"
                    required={false}
                    valueAs={parsePrice}
                    value={typedCapacity == null || Number.isNaN(typedCapacity) ? "" : String(typedCapacity)}
                    register={register}
                  />

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

                <Controller
                  name="kit"
                  control={control}
                  render={({ field }) => (
                    <KitSelector value={field.value} onChange={field.onChange} modesLayout="row" />
                  )}
                />

                {/*
                  Nothing about the draw belongs on this form, and two separate things used to be
                  here. Mezclar equipos sat under a separator next to Confirmar, which is exactly
                  why nobody looking at a 6v4 ever found it — it lives on the match screen now,
                  beside Compartir. And "Sorteo al azar" is a claim about something that already
                  happened, not a switch to flip mid-edit: turning it off re-enabled dragging and
                  laundered the promise in three taps.

                  Same two-button row as every other dialog: the confirm is the primary action.
                */}
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
