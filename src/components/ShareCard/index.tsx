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
*/
const SHARE_WIDTH = 400;

const ShareCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className="pointer-events-none fixed top-0 flex flex-col gap-5 bg-canvas p-5"
    style={{ left: -9999, width: SHARE_WIDTH }}
  >
    {/*
      The picture leaves for a group chat on its own, so it carries the wordmark the page keeps in
      its header — shaped like that header, over the same glow the body is painted on.
    */}
    <div
      className="flex justify-center border-b border-border pb-5"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 90% 140% at 50% -40%, color-mix(in oklab, var(--color-primary-600) 22%, transparent), transparent 70%)",
      }}
    >
      <Logo />
    </div>

    <MatchSummary />
  </div>
));

ShareCard.displayName = "ShareCard";

export default ShareCard;
