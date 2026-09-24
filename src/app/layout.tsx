import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import classNames from "classnames";
import Logo from "@/components/Logo";
import ConfirmDialog from "@/components/ConfirmDialog";
import DevBar from "@/components/DevBar";
import Toasts from "@/components/Toasts";
import MovedNotice from "@/components/MovedNotice";
import FeedbackModal from "@/components/FeedbackModal";
import FeedbackButton from "@/components/FeedbackButton";
import { FEEDBACK_ENABLED } from "@/utils/feedback";
import { URL_BASE, handoffScript } from "@/utils/site";

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

/*
  The link lives in a WhatsApp group description and is opened from there, so the card WhatsApp
  draws for it is the app's front door — more so than anything a search engine does with this. It
  had none: no openGraph block at all, which is a bare grey row with a hostname in it.

  metadataBase is what makes the relative image URL below absolute. Without it Next warns and the
  card silently falls back to nothing, which is the same bare row.
*/
const TITLE = "Teammaker";
const DESCRIPTION = "Pegá la lista del grupo y armá los dos equipos. Compartilos como imagen en un toque.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  /*
    One word, the way the wordmark draws it. The tab used to say "Team Maker" while the header said
    TEAMMAKER and the domain said teammaker — three spellings of the same name.
  */
  title: TITLE,
  description: DESCRIPTION,
  applicationName: TITLE,
  /*
    One address for search. The same build answers on teammaker.vercel.app and on every preview
    URL, and without a canonical each of them is a duplicate of the home competing with it.
  */
  alternates: { canonical: "/" },
  // Spanish, Rioplatense, like everything else a person reads here.
  openGraph: {
    type: "website",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    url: URL_BASE,
    locale: "es_AR",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/img/isotipo.svg", type: "image/svg+xml" },
    ],
    apple: "/img/maskable_logo.png",
  },
  // Added to the home screen it is an app, not a browser tab with a URL bar over the teams.
  appleWebApp: { capable: true, title: TITLE, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  /*
    The canvas, measured rather than remembered: --background is oklch(12% 0.019 293.76), which is
    #06050c. The old value was #17161b, a neutral grey left over from before the theme carried the
    brand hue — so Android drew its address bar a different, lighter colour than the page under it.
  */
  themeColor: "#06050c",
};

/* What the app is, in the vocabulary search engines read: a free web app, in Spanish. */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: TITLE,
  url: URL_BASE,
  description: DESCRIPTION,
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  inLanguage: "es-AR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
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
  <html lang="es-AR" data-theme="dark" className={classNames(body.variable, geistMono.variable)}>
    <head>
      {/* Before the bundle, so the stores hydrate from what it writes. See handoff() for why. */}
      <script dangerouslySetInnerHTML={{ __html: handoffScript() }} />
    </head>
    <body className="grid min-h-dvh grid-rows-[4rem_1fr] font-sans text-text antialiased">
      {/*
        No fill of its own, only blur. A flat bg-canvas/70 here was darker than the violet glow
        behind it, so the top four rems of every screen read as a separate, duller band with a hard
        edge along the bottom. The blur alone keeps anything scrolling underneath legible.
      */}
      <header className="sticky top-0 z-20 grid w-full place-items-center border-b border-border/60 backdrop-blur-md">
        <Logo />
        {FEEDBACK_ENABLED && <FeedbackButton />}
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
      {/* Once, for whoever arrived through the old address. Remove with the handoff. */}
      <MovedNotice />
      {/* Mounted here, not in a page: the share nudge opens it from wherever the share happened. */}
      {FEEDBACK_ENABLED && <FeedbackModal />}
      {process.env.NODE_ENV === "development" && <DevBar />}
      {/*
        Vercel Web Analytics: visits, pages and where people come from, with no cookies and nothing
        that identifies anyone, which is why it needs no consent banner. The only way to know
        whether the move to teammaker.com.ar and the search work are bringing anyone in.
      */}
      <Analytics />
      <script
        type="application/ld+json"
        // A constant of our own, not user input, so there is nothing here to escape.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
    </body>
  </html>
);

export default Layout;
