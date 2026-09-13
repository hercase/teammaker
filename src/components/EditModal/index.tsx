import { Fragment, FC, useEffect } from "react";
import { useMatchStore } from "@/store";
import { MatchInputs } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import KitSelector from "@/components/KitSelector";
import DateInput from "@/components/DateInput";
import TextInput from "@/components/TextInput";

interface EditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ isOpen, setIsOpen }) => {
  const { organizer, location, date, kit, random, setMatch } = useMatchStore();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MatchInputs>({
    /*
      onTouched, not onBlur: both check the field when you first leave it, but onBlur only checks
      again on the next blur, so a field stays red while you are fixing it. onTouched re-checks on
      every keystroke once the field has been visited.
    */
    mode: "onTouched",
    defaultValues: { organizer, location, kit, date, random },
  });

  /*
    The dialog never unmounts, so useForm keeps whatever was last typed into it. Without this,
    Cancelar only hid the form: the abandoned values were still there on the next Editar, and were
    written to the store by the next Confirmar. Reopening now always starts from the saved match.
  */
  useEffect(() => {
    if (isOpen) reset({ organizer, location, kit, date, random });
  }, [isOpen, reset, organizer, location, kit, date, random]);

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    setMatch({
      organizer: data.organizer,
      location: data.location,
      date: data.date,
      // Not data.random: how the teams were built is not something an edit gets to rewrite.
      random,
      kit: data.kit,
    });

    setIsOpen(false);
  };

  const transitions = {
    enter: "ease-out duration-200",
    leave: "ease-in duration-150",
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    leaveFrom: "opacity-100 scale-100",
    leaveTo: "opacity-0 scale-95",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child as={Fragment} {...transitions}>
          <div className="overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} {...transitions}>
              <Dialog.Panel className="modal w-full max-w-md transform overflow-hidden p-6 text-left align-middle transition-all">
                <Dialog.Title as="h3" className="font-display text-xl font-bold uppercase tracking-wide text-text">
                  Editar
                </Dialog.Title>
                <form className="flex flex-col gap-6 mt-4" onSubmit={handleSubmit(onSubmit)}>
                  <TextInput name="organizer" label="Organizador" error={!!errors.organizer} register={register} />

                  <TextInput name="location" label="Lugar" error={!!errors.location} register={register} />
                  {/*
                    No future check here. Editing is also what you do ten minutes before kick-off,
                    when someone drops out — and a match starting in under fifteen minutes would
                    have failed a rule meant for creating one, making the location unfixable.
                  */}
                  <DateInput register={register} error={!!errors.date} requireFuture={false} />

                  {/*
                    The draw is not editable, and that is the point of it.

                    It says the teams were not arranged by anyone, which is a claim made to the
                    group, about something that already happened. This used to be a switch that
                    appeared only when the match had been drawn — so it could be turned off, and
                    turning it off re-enabled dragging players between teams. Draw the teams, edit,
                    flip the switch, rearrange: the promise laundered in three taps.

                    Replacing, dropping and renaming a player stay available, because those are
                    facts about who turned up, not about how the sides were picked.
                  */}
                  {random && (
                    <p className="flex items-center gap-2 rounded-lg border border-secondary-700 px-3 py-2.5 text-sm text-secondary-300">
                      <ArrowsRightLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Los equipos se sortearon al azar y no se pueden reordenar.
                    </p>
                  )}
                  <Controller
                    name="kit"
                    control={control}
                    render={({ field }) => <KitSelector value={field.value} onChange={field.onChange} />}
                  />
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditModal;
