"use client";

import { useEffect, useState } from "react";
import { ArrowLongRightIcon, CheckCircleIcon, LinkIcon, SparklesIcon, TruckIcon } from "@heroicons/react/20/solid";
import { Link, Modal, toast } from "@heroui/react";
import Button from "@/components/Button";
import { useUiStore } from "@/store";
import { FEEDBACK_ENABLED } from "@/utils/feedback";
import { LEGACY_HOST, MOVED_NOTICE_KEY, URL_BASE, type MovedNotice as Notice } from "@/utils/site";

const HOST = new URL(URL_BASE).host;

const read = (): Notice | null => {
  try {
    return window.localStorage.getItem(MOVED_NOTICE_KEY) as Notice | null;
  } catch {
    return null;
  }
};

/*
  Said once, to whoever arrived through the old address — the handoff leaves the mark, this reads
  it. The move is silent otherwise: the page looks identical, and the link in the group description
  would go on pointing at the old host for ever, one redirect away from breaking. So the notice
  carries the one thing only the group can do, which is change that link, with the link ready to
  copy.

  HeroUI's anatomy for an announcement, as its own demos write it: close button, icon and heading in
  the header, the text, and one action in the footer.

  Colour speaks the app's own language rather than decorating: cyan is *came in* everywhere else
  (the team list, the history), and arriving at the new address with everything saved is exactly
  that — so the icon, the address and the reassurance are cyan, and nothing here is violet except
  the one action. A grey icon tile read as disabled. The truck stays: a house was tried and read
  less clearly.
*/
const MovedNotice = () => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const { setShowFeedback } = useUiStore();

  // Read after mount: the server has no localStorage, and the first render must match its HTML.
  useEffect(() => setNotice(read()), []);

  const isOpen = notice === "carried" || notice === "arrived";

  const dismiss = () => {
    try {
      window.localStorage.setItem(MOVED_NOTICE_KEY, "seen");
    } catch {
      // Private mode: it will say it again next time, which is the lesser harm.
    }
    setNotice("seen");
  };

  /*
    One dialog hands over to the other rather than stacking on it: this one closes (and counts as
    seen), then the feedback one opens once the exit has played. Opened in the same tick, the two
    overlays fought over focus and the second opened behind the first's fading backdrop.
  */
  const giveFeedback = () => {
    dismiss();
    setTimeout(() => setShowFeedback(true), 250);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(URL_BASE);
      toast.success("Link copiado");
    } catch {
      toast.danger(`No se pudo copiar. El link es ${HOST}`);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && dismiss()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[400px]">
          {/*
            HeroUI's X is a 24px pill filled with --default, the grey this app already learned reads
            as "off", and under the 44px a thumb needs. Bare icon, 44px box, the hover wash of any
            unchosen option; top/end pulled in by the extra size so the icon sits where it did.
          */}
          <Modal.CloseTrigger aria-label="Cerrar" className="end-2 top-2 size-11 rounded-full bg-transparent text-text-muted hover:bg-surface-hover hover:text-text data-[hovered=true]:bg-surface-hover [&_svg]:size-5" />
          <Modal.Header>
            <Modal.Icon className="bg-secondary-500/15 text-secondary-300">
              <TruckIcon className="size-5" aria-hidden />
            </Modal.Icon>
            {/* The type scale's dialog title: 18/600. HeroUI's default heading is a step smaller. */}
            <Modal.Heading className="text-lg font-semibold">Nos mudamos</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3 text-sm text-text-muted">
            {/*
              Two sentences: where it is now, and that nothing was lost. A third asked organisers to
              update the group's link and was cut — the Copiar el link button already says it, and
              the first draft ran to nine lines on a phone for a notice read once and closed. Cut
              to the bone it read as a telegram, so each sentence keeps its second half.
            */}
            {/*
              The move, shown rather than told: the old address struck through in the rose that means
              *went out* and the new one in the cyan that means *came in* — the history's own
              colours for the same idea. Words alone left the notice feeling unfinished; this is the
              one thing on it worth looking at, and it lets the sentence under it drop the address.
              Stacked, arrow pointing down, until sm: side by side the two addresses need about 300px
              and a phone's dialog gives them 278, so the row broke with the arrow hanging off the end.
            */}
            <p className="flex flex-col items-center gap-1 rounded-xl bg-surface-secondary px-4 py-3 sm:flex-row sm:justify-center sm:gap-2">
              <span className="text-error-400 line-through decoration-error-400/60">{LEGACY_HOST}</span>
              <ArrowLongRightIcon className="size-4 shrink-0 rotate-90 text-text-muted sm:rotate-0" aria-label="ahora es" />
              <strong className="font-semibold text-secondary-300">{HOST}</strong>
            </p>
            <p>Es la misma app, con dirección nueva.</p>
            {/*
              Said to everyone, not only when something came across: with nothing saved there was
              nothing to lose, and the worry it answers is the same either way.
            */}
            <p className="flex gap-2 text-text">
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-secondary-400" aria-hidden />
              Todo lo que tenías guardado vino con vos, no tenés que hacer nada.
            </p>
          </Modal.Body>
          <Modal.Footer className="flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={copyLink}>
              <LinkIcon className="size-5" aria-hidden />
              Copiar el link
            </Button>
            <Button className="w-full sm:flex-1" onClick={dismiss}>
              Listo
            </Button>
          </Modal.Footer>
          {/*
            An aside, under the buttons: the notice has one job — get the link in the group changed —
            and a third button would compete with it. "Ya que estamos" is what it is: while you are
            here.

            A band, not a line. A 12px sentence under a separator read as text left over at the
            bottom; bled to the dialog's edges (its p-6 cancelled), one step lighter and closed by
            the dialog's own corners, it reads as a footer section of its own, and the sparkles tie
            it to the dialog it opens. The link keeps a 44px box however small its text.
          */}
          {FEEDBACK_ENABLED && (
            <div className="-mx-6 -mb-6 mt-6 flex flex-wrap items-center gap-x-2 rounded-b-[inherit] border-t border-border/60 bg-surface-secondary px-6 py-1">
              <SparklesIcon className="size-4 shrink-0 text-secondary-400" aria-hidden />
              <p className="text-xs text-text-muted">¿Qué le agregarías?</p>
              <Link
                onPress={giveFeedback}
                className="ml-auto inline-flex min-h-11 items-center text-xs font-medium text-text underline decoration-text-muted underline-offset-4 hover:decoration-text"
              >
                Contanos
              </Link>
            </div>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default MovedNotice;
