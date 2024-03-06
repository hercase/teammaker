import { Fragment, FC } from "react";
import { matchStore } from "@/store";
import { MatchInputs } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import Input from "@/components/Input";

interface EditModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ isOpen, setIsOpen }) => {
  const { organizer, location, date, colors, setMatch, setColors } = matchStore();

  const {
    register,
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
                  <Input
                    label="Lugar"
                    variant="outline"
                    error={!!errors.location}
                    labelClassName="text-gray-700"
                    {...register("location")}
                  />
                  <Input
                    type="datetime-local"
                    label="Fecha"
                    variant="outline"
                    error={!!errors.date}
                    labelClassName="text-gray-700"
                    {...register("date")}
                  />

                  <div>
                    <p>Colores</p>
                    <div className="flex gap-4">
                      <div className="flex gap-2 text-sm items-center">
                        Equipo A
                        <input
                          type="color"
                          className="rounded-lg border border-gray-300 p-1 w-8 h-8"
                          {...register("colors.teamA")}
                        />
                      </div>
                      <div className="flex gap-2 text-sm items-center">
                        Equipo B
                        <input
                          type="color"
                          className="rounded-lg border border-gray-300 p-1 w-8 h-8"
                          {...register("colors.teamB")}
                        />
                      </div>
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
