"use client";

import { RefObject, useCallback, useRef, useState } from "react";
import { toast } from "@heroui/react";
import { useUiStore } from "@/store";
import { FEEDBACK_ENABLED, countShareAndShouldNudge } from "@/utils/feedback";

/*
  Nobody sends the link: everyone screenshots the teams and posts the picture. A screenshot catches
  whatever else is on screen — the row menus, the buttons underneath, half the browser — so this
  draws the same teams to an image on its own and hands it over.

  Where it hands it depends on the machine, and the difference is not cosmetic:

  On a phone the system share sheet is the whole point — one tap and it is in the group.

  On a desktop it is a trap. macOS offers Copy in that same sheet, which is what you reach for, and
  it writes the picture to the pasteboard in several flavours at once. WhatsApp pastes more than one
  of them and the same teams arrive twice. So the desktop never sees the sheet: the picture is
  written to the clipboard here, as a single image/png, and one paste gives one image.
*/
interface ShareOptions {
  // Rides along with the picture, for the apps that show a caption beside it.
  text: string;
  // Without the extension: "quintana_y_salta_16sep" rather than "equipos (3)".
  name: string;
}

interface ShareTeams {
  // Hand this to the off-screen ShareCard, and render that card while isSharing is true.
  ref: RefObject<HTMLDivElement | null>;
  share: (options: ShareOptions) => Promise<void>;
  isSharing: boolean;
}

// The row menus are controls, and the picture is not. Removed, not hidden, so their space closes up.
const HIDDEN = '[data-share="hide"]';

// Lets React lay the card out before it is measured. It is off-screen, so nothing flashes.
const nextPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

// A finger, not a mouse. Desktop Safari can share files perfectly well; it should still not be asked to.
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

const canCopyImages = () => typeof ClipboardItem !== "undefined" && typeof navigator.clipboard?.write === "function";

/*
  Once ever, after the third share (the rule lives in countShareAndShouldNudge). It waits out the
  share itself so it arrives as a second, quieter thought rather than on top of the confirmation:
  after the share sheet a moment is enough, but after a "Copiado" toast it has to outlast that
  toast's 4s, or the two stack and read as one loud pile. The action is outlined, not violet — the
  brand is for the screen's own actions, and this is an aside — and it dismisses itself if ignored.
*/
const AFTER_SHEET = 1500;
const AFTER_TOAST = 4500;

const afterShare = (delay: number) => {
  if (!FEEDBACK_ENABLED || !countShareAndShouldNudge(window.localStorage)) return;

  setTimeout(
    () =>
      toast("¿Te está sirviendo Teammaker?", {
        description: "Si le agregarías algo, contanos.",
        actionProps: {
          children: "Contanos",
          variant: "outline",
          // The same 3:1 edge as the app's own outline buttons; HeroUI's measured 1.07:1 here.
          className: "border-border-strong/60",
          onPress: () => useUiStore.getState().setShowFeedback(true),
        },
        timeout: 10_000,
      }),
    delay
  );
};

/*
  On a phone the share sheet is its own answer, so only the two silent outcomes say anything. What
  says it is HeroUI's toast queue rather than a component of ours: it owns the stacking, the
  auto-dismiss and the live region, which is three things this app was keeping by hand for one
  message. Toast.Provider is mounted once, in the layout.
*/
const useShareTeams = (): ShareTeams => {
  const ref = useRef<HTMLDivElement>(null);
  const [isSharing, setSharing] = useState(false);

  /*
    A ref, not the isSharing state: state is applied on the next render, and two taps inside one
    frame both read the old value and both open a share sheet. This one is written synchronously.
  */
  const running = useRef(false);

  const share = useCallback(async ({ text, name }: ShareOptions) => {
    if (running.current) return;

    running.current = true;
    setSharing(true);

    try {
      // Loaded on the tap. Nobody who never shares should download a rasteriser with the screen.
      const { snapdom } = await import("@zumer/snapdom");

      await nextPaint();

      if (!ref.current) throw new Error("No se pudo generar la imagen");

      const canvas = getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim();

      const blob = await snapdom.toBlob(ref.current, {
        type: "png",
        dpr: 2,
        backgroundColor: canvas,
        exclude: [HIDDEN],
        excludeMode: "remove",
        embedFonts: true,
      });

      if (!blob) throw new Error("No se pudo generar la imagen");

      const fileName = `${name}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (isTouchDevice() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        afterShare(AFTER_SHEET);
        return;
      }

      if (canCopyImages()) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Copiado al portapapeles");
        afterShare(AFTER_TOAST);
        return;
      }

      /*
        The last resort, for a browser with neither the share sheet nor image clipboard support.
        The link has to be in the document and the object URL has to outlive the click: revoking it
        on the next line cancelled the download the click had just started, so nothing was saved
        and the toast said "Imagen descargada" anyway.
      */
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success("Imagen descargada");
      afterShare(AFTER_TOAST);
    } catch (error) {
      // Dismissing the share sheet is a decision, not a failure, and must not be reported as one.
      if (error instanceof DOMException && error.name === "AbortError") return;

      toast.danger("No se pudo generar la imagen");
    } finally {
      running.current = false;
      setSharing(false);
    }
  }, []);

  return { ref, share, isSharing };
};

export default useShareTeams;
