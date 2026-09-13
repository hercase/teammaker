import { FC } from "react";
import { LIGHT_HEX } from "@/utils/kit";

interface ShirtIconProps {
  color?: string;
  // Only the dark shirt asks for one, and only because no fill can hold a shape on this background.
  outline?: string;
  size?: number;
}

/*
  A silhouette, not an illustration. The previous icon was a 512px drawing with a collar, cuffs, a
  hem seam and a little tag, all of which turn to mush at the 28px this is actually rendered at.

  A ring around every shirt read as a sticker, so only the one that needs it gets a contour, and it
  needs it for a reason no palette can argue with: measured against this panel a dark fill reaches
  1.57:1 and a darker one 1.06:1. The others are chosen to hold up on their own.
*/
const ShirtIcon: FC<ShirtIconProps> = ({ color = LIGHT_HEX, outline, size = 42, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <path
      d="M8.8 2.6 4.7 4.3a1 1 0 0 0-.6.7L3.1 9a.8.8 0 0 0 .5.9l2.1.7a.5.5 0 0 0 .7-.5V20a1.4 1.4 0 0 0 1.4 1.4h8.4A1.4 1.4 0 0 0 17.6 20v-9.9a.5.5 0 0 0 .7.5l2.1-.7a.8.8 0 0 0 .5-.9L20 5a1 1 0 0 0-.6-.7l-4.1-1.7a3.4 3.4 0 0 1-6.5 0Z"
      fill={color}
      stroke={outline}
      strokeWidth={outline ? 1.1 : undefined}
      strokeLinejoin="round"
    />
  </svg>
);

export default ShirtIcon;
