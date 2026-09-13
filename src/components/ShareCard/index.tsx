import { forwardRef } from "react";
import Logo from "@/components/Logo";
import MatchSummary from "@/components/MatchSummary";

/*
  What actually gets photographed. It is a second copy of the match, drawn off-screen at a fixed
  width, and both of those matter.

  Off-screen, because the first attempt drew the header into the page itself and the screen showed
  two TEAMMAKER titles for as long as the share sheet stayed open. Here it is parked far to the
  left: laid out and measurable, never seen, never in the tab order.

  Fixed width, because otherwise the picture is a photograph of whoever's screen made it — a phone
  produced two narrow columns and a laptop produced two wide ones, for the same twelve players. The
  group gets the same image either way.

  And once the width is ours to choose, it stops being a phone's width. 520 rather than 400 buys
  each team column about 60px, which is the difference between "Fede (CAMINO)" and "Fede (CAMI…)" —
  the names were being cut to fit a screen the picture is not shown on.
*/
const SHARE_WIDTH = 520;

const ShareCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className="pointer-events-none fixed top-0 flex flex-col gap-5 bg-canvas p-5"
    /*
      The page's own light, lit from above the top edge, so the picture has one light source. The
      glow used to sit on the logo strip alone and the rest was flat canvas, which read as a darker
      band across the top of every image.
    */
    style={{
      left: -9999,
      width: SHARE_WIDTH,
      backgroundImage:
        "radial-gradient(ellipse 90% 32% at 50% -2%, color-mix(in oklab, var(--color-primary-600) 26%, transparent), transparent 70%)",
    }}
  >
    {/*
      The picture leaves for a group chat on its own, so it carries the wordmark the page keeps in
      its header — shaped like that header, over the same glow the body is painted on.
    */}
    <div className="flex justify-center border-b border-border/60 pb-5">
      <Logo />
    </div>

    <MatchSummary />
  </div>
));

ShareCard.displayName = "ShareCard";

export default ShareCard;
