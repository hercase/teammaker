"use client";

import { FC } from "react";
import { Toast } from "@heroui/react";

/*
  A "use client" boundary, not a component of ours.

  HeroUI's toast queue needs its provider mounted once for the whole app, and the only place that
  is true is the root layout — which is a Server Component, and @heroui/react is client-only. So
  the provider is re-exported through here. Everything it renders is the library's.
*/
const Toasts: FC = () => <Toast.Provider />;

export default Toasts;
