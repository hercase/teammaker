import type { Metadata } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ConfirmDialog from "@/components/ConfirmDialog";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos tambien podes crear equipos rápidamente y compartilos de con tus amigos!",
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
        "grid grid-rows-[4rem_1fr] h-screen text-white bg-primary-950 max-w-1200 mx-auto w-95vw"
      )}
    >
      <header className="grid place-items-center">
        <Logo dark />
      </header>
      <main className="flex flex-col items-center h-full bg-gradient-to-b from-primary-900 to-primary-950 max-w-screen-lg mx-auto w-full rounded-t-md">
        {children}
      </main>
      <ConfirmDialog />
    </body>
  </html>
);

export default Layout;
