"use client";

import classNames from "classnames";
import { usePathname } from "next/navigation";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/20/solid";
import { Button, Tooltip } from "@heroui/react";
import { useUiStore } from "@/store";

/*
  The standing door to feedback, in the header next to the wordmark — where Vercel and Linear keep
  theirs. A footer line was tried first and read as a legal footer with nothing else in it, below
  Crear equipos where nobody scrolls. A floating corner button was ruled out: on a phone that corner
  is where the thumb rests while scrolling, and it would sit over the match people photograph.

  An icon, not a labelled button. "Sugerencias" beside a centred wordmark, in a header with nothing
  else in it, was the loudest thing in the bar and pulled the eye off the logo; a single glyph
  balances it instead. What the word was saying moves to the accessible name and to HeroUI's
  Tooltip on hover and focus.

  Aligned to the content column, not the viewport. At the far edge of a laptop screen it floated
  800px from anything it belonged to; on the column's right edge it lines up with the list and the
  panels under it. The column is a different width on each page — the form opens up to the lg
  breakpoint from md, the match stops at 3xl — so it follows the route. The wrapper spans the
  header and lets pointer events through, so only the button itself is a target.

  Drawn like the modals' X: bare, 44px, the hover wash of an unchosen option. HeroUI's ghost hover
  is --default at 51%, the grey this app reads as "off", so it is overridden.
*/
const FeedbackButton = () => {
  const { setShowFeedback } = useUiStore();
  const isForm = usePathname() === "/";

  return (
    <div className="pointer-events-none absolute inset-0 flex justify-center px-5 sm:px-6">
      <div
        className={classNames(
          "flex w-full max-w-md items-center justify-end",
          isForm ? "md:max-w-(--breakpoint-lg)" : "lg:max-w-3xl"
        )}
      >
        <Tooltip delay={300}>
          <Button
            isIconOnly
            variant="ghost"
            size="lg"
            aria-label="Enviar una sugerencia"
            onPress={() => setShowFeedback(true)}
            className="pointer-events-auto size-11 rounded-full text-text-muted hover:!bg-surface-hover hover:text-text data-[hovered=true]:!bg-surface-hover"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="size-5" aria-hidden />
          </Button>
          <Tooltip.Content placement="bottom">
            <p>Enviar una sugerencia</p>
          </Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
};

export default FeedbackButton;
