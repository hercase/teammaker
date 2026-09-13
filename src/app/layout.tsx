import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ConfirmDialog from "@/components/ConfirmDialog";
import DevBar from "@/components/DevBar";

import "./globals.css";

/*
  Geist, a geometric Swiss sans drawn for interfaces and tuned for dark backgrounds, which is the
  only background this app has. It replaces a pairing of Barlow with Barlow Condensed: rather than
  a second family for headings, the display role is the same face at 700 with tight tracking, so
  the hierarchy comes from weight and spacing instead of from a change of voice.

  Geist Mono comes with it and takes over the pasted list, which used to fall back to whatever
  monospace the device happened to have.
*/
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos también podés crear equipos rápidamente y compartirlos con tus amigos!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#16122a",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="es">
    <body
      className={classNames(
        geist.variable,
        geistMono.variable,
        "grid min-h-dvh grid-rows-[4rem_1fr] font-sans text-text antialiased"
      )}
    >
      <header className="sticky top-0 z-20 grid place-items-center w-full border-b border-border bg-canvas/70 backdrop-blur-md">
        <Logo />
      </header>
      {/* min-w-0 because a grid item, like a flex item, is never narrower than its own content
          unless told so. Without it one long player name widened the page itself and the whole
          layout scrolled sideways on a phone. */}
      <main className="flex w-full min-w-0 items-start justify-center px-3 pb-16 pt-8 sm:px-4 sm:pt-10">
        {children}
      </main>
      <ConfirmDialog />
      {process.env.NODE_ENV === "development" && <DevBar />}
    </body>
  </html>
);

export default Layout;
