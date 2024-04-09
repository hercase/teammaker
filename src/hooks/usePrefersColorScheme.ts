"use client";

import { useState, useEffect } from "react";

export type ColorScheme = "light" | "dark";

interface usePrefersColorSchemeReturn {
  colorScheme: ColorScheme | null;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleColorScheme: () => void;
}

export function usePrefersColorScheme(): usePrefersColorSchemeReturn {
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null);

  const isDarkMode = colorScheme === "dark";
  const isLightMode = colorScheme === "light";

  const toggleColorScheme = (): void => {
    const newColorScheme = isDarkMode ? "light" : "dark";
    setColorScheme(newColorScheme);
    localStorage.setItem("theme", newColorScheme);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const localTheme = localStorage.getItem("theme") as ColorScheme | null;
    if (localTheme) {
      setColorScheme(localTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setColorScheme("dark");
    }
  }, []);

  useEffect(() => {
    if (colorScheme === null) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(colorScheme);
  }, [colorScheme]);

  return {
    colorScheme,
    isDarkMode,
    isLightMode,
    toggleColorScheme,
  };
}
