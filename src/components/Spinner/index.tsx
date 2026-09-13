import { FC } from "react";
import { Spinner as HeroSpinner } from "@heroui/react";

/*
  HeroUI's spinner, centred. What this replaces was a hand-drawn SVG with two paths and a
  hard-coded viewBox, which is a lot of markup to say "loading" — and it carried its own colour
  instead of the theme's.
*/
const Spinner: FC = () => (
  <div role="status" className="flex h-full w-full items-center justify-center">
    <HeroSpinner />
    <span className="sr-only">Cargando…</span>
  </div>
);

export default Spinner;
