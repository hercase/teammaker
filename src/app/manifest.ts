import type { MetadataRoute } from "next";

/*
  The link is opened from a group description on a phone, and the most common thing after that is
  to keep it. Added to the home screen it should open as the app rather than as a tab with a URL
  bar sitting over the teams — which is what display: "standalone" buys, and what an app with no
  manifest at all cannot offer.

  background_color is the canvas the splash screen paints while it boots, so it matches
  --background exactly; anything else is a flash of the wrong dark before the first paint.
*/
const manifest = (): MetadataRoute.Manifest => ({
  name: "Teammaker",
  short_name: "Teammaker",
  description: "Pegá la lista del grupo y armá los dos equipos. Compartilos como imagen en un toque.",
  start_url: "/",
  display: "standalone",
  background_color: "#06050c",
  theme_color: "#06050c",
  lang: "es-AR",
  icons: [
    { src: "/img/maskable_logo.png", sizes: "400x400", type: "image/png", purpose: "maskable" },
    { src: "/img/maskable_logo.png", sizes: "400x400", type: "image/png", purpose: "any" },
  ],
});

export default manifest;
