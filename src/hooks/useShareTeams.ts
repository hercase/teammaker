"use client";

import { RefObject, useCallback, useRef, useState } from "react";

/*
  Nobody sends the link: everyone screenshots the teams and posts the picture. A screenshot catches
  whatever else is on screen — the row menus, the buttons underneath, half the browser — so this
  draws the same teams to an image on its own and hands it to the system share sheet.

  Sharing a file is a phone capability. Desktop browsers that cannot do it get the file saved
  instead, which is the same picture by a longer road.
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
  failed: boolean;
}

// The row menus are controls, and the picture is not. Removed, not hidden, so their space closes up.
const HIDDEN = '[data-share="hide"]';

// Lets React lay the card out before it is measured. It is off-screen, so nothing flashes.
const nextPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const useShareTeams = (): ShareTeams => {
  const ref = useRef<HTMLDivElement>(null);
  const [isSharing, setSharing] = useState(false);
  const [failed, setFailed] = useState(false);

  const share = useCallback(async ({ text, name }: ShareOptions) => {
    setSharing(true);
    setFailed(false);

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

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Dismissing the share sheet is a decision, not a failure, and must not be reported as one.
      if (error instanceof DOMException && error.name === "AbortError") return;

      setFailed(true);
    } finally {
      setSharing(false);
    }
  }, []);

  return { ref, share, isSharing, failed };
};

export default useShareTeams;
