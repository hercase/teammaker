import { useState, useEffect } from "react";

export type ColorScheme = "light" | "dark";

interface usePrefersColorSchemeReturn {
  colorScheme: ColorScheme;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleColorScheme: () => void;
}

export function usePrefersColorScheme(): usePrefersColorSchemeReturn {
  const [theme, setTheme] = useState(localStorage.theme);

  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  const isDarkMode = theme === "dark";
  const isLightMode = theme === "light";

  const toggleColorScheme = (): void => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // save theme to local storage
    localStorage.setItem("theme", theme);
  }, [theme, colorScheme]);

  useEffect(() => {
    if (!window.matchMedia) {
      setColorScheme("light");
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    setColorScheme(mediaQuery.matches ? "dark" : "light");

    function onChange(event: MediaQueryListEvent): void {
      setColorScheme(event.matches ? "dark" : "light");
    }

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return {
    colorScheme,
    isDarkMode,
    isLightMode,
    toggleColorScheme,
  };
}
