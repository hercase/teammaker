import { ImageResponse } from "next/og";
import { URL_BASE } from "@/utils/site";

/*
  The card WhatsApp draws when the link is pasted into the group. Generated rather than committed
  as a PNG so it cannot drift from the app's own colours: the background is --background and the
  violet is --color-primary-600, the same two the page is painted with.

  Drawn with plain divs and no web font on purpose. ImageResponse has to fetch and embed any font
  it is given, which is a build-time network call and a binary in the repo for one image; the
  system fallback renders this at 128px perfectly well.
*/
export const alt = "Teammaker — armá los dos equipos y compartilos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const Image = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#06050c",
          // The same violet glow the app banks into the corner of its match card.
          backgroundImage: "radial-gradient(circle at 20% 0%, #7039d0 0%, rgba(112,57,208,0) 55%)",
        }}
      >
        <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -2, color: "#ffffff" }}>TEAMMAKER</div>
        <div style={{ fontSize: 40, color: "#a9a7b4" }}>Pegá la lista del grupo y armá los dos equipos</div>
        {/*
          The address, because the card is how most of the group meets the link and the move to
          teammaker.com.ar only sticks if people see it. In --color-secondary-300, the cyan the app uses for "came in".
        */}
        <div style={{ marginTop: 20, fontSize: 36, fontWeight: 600, color: "#7cd5e4" }}>{new URL(URL_BASE).host}</div>
      </div>
    ),
    size
  );

export default Image;
