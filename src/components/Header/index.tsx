"use client";

import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="grid place-items-center relative max-w-screen-lg mx-auto w-full z-50">
      <Logo />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
        <ThemeSwitcher />
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className=" inline-flex items-center justify-center rounded-md p-2.5 text-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 !z-30 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-gray-900">
              <div className="px-4 py-3">
                <div className="flex items-center gap-5">
                  <Image
                    className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                    src={session?.user?.image || ""}
                    alt=""
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="text-sm">{session?.user?.name}</p>
                    <p className="truncate text-xs text-gray-900">{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/matches"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Mis partidos
                  </a>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block w-full px-4 py-2 text-left text-sm"
                    )}
                  >
                    Cerrar sesión
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
