import { Fragment, FC } from "react";
import { MatchFields, MatchInputs } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "@/components/Button";
import ColorPicker from "@/components/ColorPicker";
import DateInput from "@/components/DateInput";
import TextInput from "@/components/TextInput";
import ToggleSwitch from "../ToggleSwitch";

interface EditModalProps {
  match: MatchFields;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const EditModal: FC<EditModalProps> = ({ match, isOpen, setIsOpen }) => {
  const { location, date, colors, random } = match;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchInputs>({
    mode: "onBlur",
    defaultValues: { location, colors, date, random },
  });

  const onSubmit: SubmitHandler<MatchInputs> = (data) => {
    console.log(data);
    setIsOpen(false);
  };

  const transitions = {
    enter: "ease-out duration-300",
    leave: "ease-in duration-200",
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    leaveFrom: "opacity-100 scale-100",
    leaveTo: "opacity-0 scale-95",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child as={Fragment} {...transitions}>
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} {...transitions}>
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white   p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 ">
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
                  <div className="flex gap-2">
                    <DateInput variant="outline" register={register} error={!!errors.date} />
                    {random && (
                      <div className="flex flex-col">
                        <span className="label">Aleatorio</span>
                        <div className="flex justify-center items-center mt-1 h-full">
                          <Controller
                            name="random"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <ToggleSwitch disabled={!random} checked={field.value} onChange={field.onChange} />
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="label">Colores</p>
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
