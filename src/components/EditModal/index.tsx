import { Fragment, FC } from "react";
import { useMatchStore } from "@/store";
import { MatchInputs } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import ColorPicker from "@/components/ColorPicker";
import DateInput from "@/components/DateInput";
import TextInput from "@/components/TextInput";

interface EditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ isOpen, setIsOpen }) => {
  const { organizer, location, date, colors, setMatch, setColors } = useMatchStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchInputs>({
    mode: "onBlur",
    defaultValues: { location, colors, date },
  });

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    setMatch({
      location: data.location,
      date: data.date,
      random: data.random,
      organizer,
    });

    setColors({
      teamA: data.colors?.teamA,
      teamB: data.colors?.teamB,
    });

    setIsOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale`-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Editar
                </Dialog.Title>
                <form className="flex flex-col gap-6 mt-4 text-gray-500" onSubmit={handleSubmit(onSubmit)}>
                  <TextInput
                    variant="outline"
                    name="location"
                    label="Lugar"
                    error={!!errors.location}
                    register={register}
                  />
                  <DateInput variant="outline" error={!!errors.date} register={register} />
                  <div>
                    <p>Colores</p>
                    <div className="flex gap-6">
                      <Controller
                        name="colors.teamA"
                        control={control}
                        render={({ field }) => (
                          <ColorPicker label="Equipo A" color={field.value} onChange={field.onChange} />
                        )}
                      />

                      <Controller
                        name="colors.teamB"
                        control={control}
                        render={({ field }) => (
                          <ColorPicker label="Equipo B" color={field.value} onChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                    Confirmar
                  </Button>
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
