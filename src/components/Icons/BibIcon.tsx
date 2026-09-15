import { FC, SVGProps } from "react";
import { BIB_HEX } from "@/utils/kit";

// See ShirtIcon: the svg's own props, because the rest of them are spread onto it.
interface BibIconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
}

/*
  The same silhouette without sleeves, which is the whole difference between a bib and a shirt and
  the only detail worth drawing at this size.
*/
const BibIcon: FC<BibIconProps> = ({ color = BIB_HEX, size = 42, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <path
      d="M8.8 2.6 6.6 3.5A2.6 2.6 0 0 0 5 5.9V20a1.4 1.4 0 0 0 1.4 1.4h11.2A1.4 1.4 0 0 0 19 20V5.9a2.6 2.6 0 0 0-1.6-2.4l-2.2-.9a3.4 3.4 0 0 1-6.4 0Z"
      fill={color}
    />
  </svg>
);

export default BibIcon;
