import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import WelcomeModal from "@/components/WelcomeModal";
import DevBar from "@/components/DevBar";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos también podés crear equipos rápidamente y compartirlos con tus amigos!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#151d65",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="es">
    <body
      className={classNames(
        inter.className,
        "grid grid-rows-[4rem_1fr] min-h-dvh text-white bg-primary-950 mx-auto"
      )}
    >
      <header className="grid place-items-center relative max-w-(--breakpoint-lg) mx-auto w-full">
        <Logo />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <ThemeSwitcher />
        </div>
      </header>
      <main className="flex flex-col items-center h-full bg-linear-to-b from-primary-800 dark:from-primary-900 to-primary-950 max-w-(--breakpoint-lg) mx-auto w-full rounded-t-md">
        {children}
      </main>
      <WelcomeModal />
      {process.env.NODE_ENV === "development" && <DevBar />}
    </body>
  </html>
);

export default Layout;
