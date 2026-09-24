"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { EnvelopeIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { Alert, Input, Label, Modal, TextArea, TextField, toast } from "@heroui/react";
import Button from "@/components/Button";
import { useMatchStore, useUiStore } from "@/store";
import { isCoolingDown, sendFeedback } from "@/utils/feedback";
import { CONTACT_EMAIL } from "@/utils/site";

/*
  What people would add or change, sent to Formspree (see utils/feedback). It never opens by itself:
  the link at the foot of the match and the one-time nudge after sharing are the only doors.

  The same anatomy and the same cyan tile as MovedNotice, so the app's announcements look like one
  family. The draft survives Cancelar on purpose — unlike EditModal, nothing here is written
  anywhere until Enviar, and losing half a paragraph to a slipped thumb is the worse mistake.

  The name is optional and starts as the organiser's saved name: most of what arrives will come
  from whoever runs the match, and an anonymous idea is still an idea.
*/
const FeedbackModal = () => {
  const { showFeedback, setShowFeedback } = useUiStore();
  const { organizer } = useMatchStore();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "cooldown">("idle");
  // A ref, not state: the dialog never unmounts, so it outlives a close and a reopen, and nothing
  // renders from it.
  const lastSentAt = useRef<number | null>(null);

  // Filled on open, not on mount: the organiser's name may only exist once the store has rehydrated.
  useEffect(() => {
    if (showFeedback) {
      setName((current) => current || organizer || "");
      setStatus("idle");
    }
  }, [showFeedback, organizer]);

  const isEmpty = !message.trim();

  // Whatever is already typed goes along, so switching to mail never means typing it again.
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Teammaker: una sugerencia")}${
    message.trim() ? `&body=${encodeURIComponent(message.trim())}` : ""
  }`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isEmpty || status === "sending") return;
    if (isCoolingDown(lastSentAt.current, Date.now())) {
      setStatus("cooldown");
      return;
    }

    setStatus("sending");
    try {
      await sendFeedback({ message: message.trim(), name, gotcha: trap });
      lastSentAt.current = Date.now();
      setMessage("");
      setStatus("idle");
      setShowFeedback(false);
      toast.success("¡Gracias! Lo vamos a leer.");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal.Backdrop isOpen={showFeedback} onOpenChange={setShowFeedback}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[460px]">
          {/* Same treatment as MovedNotice's X, for the same reasons: see there. */}
          <Modal.CloseTrigger
            aria-label="Cerrar"
            className="end-2 top-2 size-11 rounded-full bg-transparent text-text-muted hover:bg-surface-hover hover:text-text data-[hovered=true]:bg-surface-hover [&_svg]:size-5"
          />
          <Modal.Header>
            <Modal.Icon className="bg-secondary-500/15 text-secondary-300">
              <SparklesIcon className="size-5" aria-hidden />
            </Modal.Icon>
            {/*
              Permission to ask for anything, not a bug report form: "¿Qué le agregarías?" asked for
              a feature and got the small ones. The question underneath keeps it concrete.
            */}
            <Modal.Heading className="text-lg font-semibold">Si tuvieras una varita mágica…</Modal.Heading>
          </Modal.Header>
          <form onSubmit={submit}>
            <Modal.Body className="flex flex-col gap-5">
              <p className="text-sm text-text-muted">
                ¿Qué le agregarías o le cambiarías a Teammaker?
              </p>
              <TextField
                value={message}
                onChange={setMessage}
                validationBehavior="aria"
                className="flex flex-col gap-2"
                autoFocus
              >
                <Label>Tu idea</Label>
                <TextArea className="min-h-32 w-full resize-none text-base" maxLength={2000} />
              </TextField>
              <TextField value={name} onChange={setName} validationBehavior="aria" className="flex flex-col gap-2">
                <Label>Tu nombre (opcional)</Label>
                <Input className="min-h-11 w-full" autoComplete="name" maxLength={80} />
              </TextField>
              {/*
                The honeypot. Out of sight, out of the tab order and out of the accessibility tree,
                so no person can fill it; a bot that fills every input does, and Formspree drops it.
              */}
              <input
                type="text"
                name="_gotcha"
                value={trap}
                onChange={(event) => setTrap(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />
              {/*
                HeroUI's Alert, in warning. It was a bare rose paragraph, which said three wrong
                things: rose already means "went out" and "this field is wrong", and a failed network
                call is neither — it is transient and nobody's fault; the colour was the only signal,
                with no icon; and sitting under the name field it read as that field's help text.
                Amber says "try again", the icon carries it without colour, and the box makes it the
                dialog's message rather than a field's.

                "We" own the failure; it says first that the text is not lost, which is the real
                worry when a form fails; and it ends on what to do. It does not point at the mail
                band: that is on screen already.
              */}
              {status === "error" && (
                // HeroUI paints an Alert with --surface, which is the dialog's own fill: the box was
                // invisible and its padding left the text indented for no visible reason. A 10%
                // wash of the warning colour over the surface and an edge in the same amber make it
                // a box; the wash alone was too close to the dialog to close the shape.
                <Alert
                  status="warning"
                  role="alert"
                  className="gap-2.5 border border-[color-mix(in_oklab,var(--warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,var(--surface))]"
                >
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>No pudimos mandarla</Alert.Title>
                    <Alert.Description>Tu idea sigue acá. Probá de nuevo en unos minutos.</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
              {status === "cooldown" && (
                <p role="alert" className="text-sm text-text-muted">
                  Recién mandaste una. Esperá unos segundos y probá de nuevo.
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowFeedback(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isEmpty || status === "sending"}>
                {status === "sending" ? "Enviando…" : "Enviar"}
              </Button>
            </Modal.Footer>
          </form>
          {/*
            The other door, always open: some people would rather write a mail than fill a box, and
            a mail can carry a screenshot. The same footer band as MovedNotice — bled to the
            dialog's edges, one step lighter — so the two dialogs speak one language.
          */}
          <div className="-mx-6 -mb-6 mt-6 flex flex-wrap items-center gap-x-2 rounded-b-[inherit] border-t border-border/60 bg-surface-secondary px-6 py-1">
            <EnvelopeIcon className="size-4 shrink-0 text-secondary-400" aria-hidden />
            <p className="text-xs text-text-muted">¿Preferís escribirnos?</p>
            <a
              href={mailto}
              className="ml-auto inline-flex min-h-11 items-center text-xs font-medium text-text underline decoration-text-muted underline-offset-4 hover:decoration-text"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default FeedbackModal;
