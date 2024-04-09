import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos tambien podes crear equipos rápidamente y compartilos de con tus amigos!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en">
    <body
      className={classNames(
        inter.className,
        "grid grid-rows-[4rem_1fr] h-screen text-white bg-terciary-500 max-w-1200 mx-auto w-95vw"
      )}
    >
      <header className="grid place-items-center relative max-w-screen-lg mx-auto w-full">
        <Logo />
      </header>
      <main className="flex flex-col items-center h-full bg-gradient-to-b from-primary-800  to-primary-950 max-w-screen-lg mx-auto w-full rounded-t-md">
        {children}
      </main>
    </body>
  </html>
);

export default Layout;
