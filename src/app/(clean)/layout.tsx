import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

import "@/app/globals.css";

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
    <body className={classNames(inter.className, " h-screen text-white bg-primary-950 max-w-1200 mx-auto w-95vw")}>
      <main className="flex flex-col items-center h-full max-w-screen-lg mx-auto w-full rounded-t-md">{children}</main>
    </body>
  </html>
);

export default Layout;
