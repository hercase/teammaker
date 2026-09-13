import { FC } from "react";

interface ShirtIconProps {
  color?: string;
  size?: number;
}

/*
  A silhouette, not an illustration. The previous icon was a 512px drawing with a collar, cuffs, a
  hem seam and a little tag, all of which turn to mush at the 28px this is actually rendered at.

  No outline either: a ring around every shirt read as a sticker, and the job it was doing is done
  instead by the preset colours themselves, which are chosen to hold up against a dark panel.
*/
const ShirtIcon: FC<ShirtIconProps> = ({ color = "#e8e8e8", size = 42, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <path
      d="M8.8 2.6 4.7 4.3a1 1 0 0 0-.6.7L3.1 9a.8.8 0 0 0 .5.9l2.1.7a.5.5 0 0 0 .7-.5V20a1.4 1.4 0 0 0 1.4 1.4h8.4A1.4 1.4 0 0 0 17.6 20v-9.9a.5.5 0 0 0 .7.5l2.1-.7a.8.8 0 0 0 .5-.9L20 5a1 1 0 0 0-.6-.7l-4.1-1.7a3.4 3.4 0 0 1-6.5 0Z"
      fill={color}
    />
  </svg>
);

export default ShirtIcon;
