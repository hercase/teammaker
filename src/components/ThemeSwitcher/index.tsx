"use client";

import { usePrefersColorScheme } from "@/hooks/usePrefersColorScheme";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";

const ThemeSwitcher = () => {
  const { colorScheme, isDarkMode, toggleColorScheme } = usePrefersColorScheme();

  if (colorScheme === null) return null;

  return (
    <button
      onClick={toggleColorScheme}
      className="p-2 rounded-md bg-primary-700 text-white dark:bg-primary-800 dark:hover:bg-primary-900 !cursor-pointer"
    >
      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeSwitcher;
