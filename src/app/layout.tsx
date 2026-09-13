import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ConfirmDialog from "@/components/ConfirmDialog";
import DevBar from "@/components/DevBar";
import Toasts from "@/components/Toasts";

import "./globals.css";

/*
  One superfamily: Geist for everything you read, Geist Mono for the pasted list.

  HeroUI's theme builder offers the font as a choice, and Inter — its default — is the safe answer
  rather than the right one here. Read back at size, uppercase, on a dark card, it went thin and
  characterless: a screen of UI chrome rather than a thing with a name on it. Geist is drawn in the
  Swiss neo-grotesque line that SF Pro comes from — tighter apertures, flatter terminals, more
  weight where a heading needs it — which is the "not generic" the app was missing, and it is the
  same family as the mono already carrying the list.

  Self-hosted by next/font, so a phone, a Mac and a Windows laptop render the same letters — the
  point of not leaning on a system face.

  What came before, and why not: Inter (correct, anonymous); Plus Jakarta Sans as a second display
  family, which only meant the app disagreed with itself wherever we had not reached; Big Shoulders,
  the athletic condensed face a football app wants on paper, unreadable on a phone at 14px.
*/
const body = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
  themeColor: "#17161b",
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  /*
    The font variables go on <html>, not on <body>, and it matters more than it looks.

    globals.css declares --font-sans on :root as `var(--font-body), …`. A custom property is
    substituted where it is read, so on :root — and with --font-body defined one level down on
    <body>, that substitution failed, --font-sans computed to nothing, and every `font-sans` in the
    app quietly fell through to the system UI face. On a Mac that is SF Pro, which is close enough
    to a grotesque that nobody noticed the web font was never loading.
  */
  <html lang="es" data-theme="dark" className={classNames(body.variable, geistMono.variable)}>
    <body className="grid min-h-dvh grid-rows-[4rem_1fr] font-sans text-text antialiased">
      {/*
        No fill of its own, only blur. A flat bg-canvas/70 here was darker than the violet glow
        behind it, so the top four rems of every screen read as a separate, duller band with a hard
        edge along the bottom. The blur alone keeps anything scrolling underneath legible.
      */}
      <header className="sticky top-0 z-20 grid w-full place-items-center border-b border-border/60 backdrop-blur-md">
        <Logo />
      </header>
      {/* min-w-0 because a grid item, like a flex item, is never narrower than its own content
          unless told so. Without it one long player name widened the page itself and the whole
          layout scrolled sideways on a phone. */}
      <main className="flex w-full min-w-0 items-start justify-center px-5 pb-16 pt-8 sm:px-6 sm:pt-10">
        {children}
      </main>
      <ConfirmDialog />
      {/* Mounted once, for the whole app: HeroUI's toast queue renders into it from anywhere. */}
      <Toasts />
      {process.env.NODE_ENV === "development" && <DevBar />}
    </body>
  </html>
);

export default Layout;
