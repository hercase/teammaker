"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Logo from "../Logo";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function WelcomeModal() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(true);
  const [organizer, setOrganizer] = useLocalStorage("organizer", "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    setOrganizer(inputRef.current?.value || "");
    window.location.reload();
  };

  if (organizer) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}} initialFocus={inputRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform transition-all isolate overflow-hidden bg-primary-950 px-6 sm:px-12 py-16 shadow-2xl rounded-3xl">
                <div className="flex justify-center mb-10">
                  <Logo animated size="large" />
                </div>
                <p className="flex flex-col mx-auto mt-2 max-w-xl text-lg leading-8 text-gray-300">
                  <span>Crear equipos nunca fue tan fácil. </span>
                  <span>Pegá una lista de nombres, agregá algunos detalles y listo!</span>
                </p>
                <form className="mx-auto mt-10 flex max-w-md gap-x-4" onSubmit={handleSubmit}>
                  <label htmlFor="name" className="sr-only">
                    Nombre
                  </label>
                  <input
                    ref={inputRef}
                    id="name"
                    name="name"
                    type="name"
                    autoComplete="name"
                    required
                    className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white/20 sm:text-sm sm:leading-6 outline-none"
                    placeholder="Ingresá tu nombre o apodo"
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </form>
                <svg
                  viewBox="0 0 1024 1024"
                  className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
                  aria-hidden="true"
                >
                  <circle
                    cx={512}
                    cy={512}
                    r={512}
                    fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                    fillOpacity="0.7"
                  />
                  <defs>
                    <radialGradient
                      id="759c1415-0410-454c-8f7c-9a820de03641"
                      cx={0}
                      cy={0}
                      r={1}
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(512 512) rotate(90) scale(512)"
                    >
                      <stop stopColor="#2dd4bf" />
                      <stop offset={1} stopColor="#2dd4bf" stopOpacity={0} />
                    </radialGradient>
                  </defs>
                </svg>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
