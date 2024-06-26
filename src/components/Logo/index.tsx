"use client";

import { FC } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";

interface LogoProps {
  animated?: boolean;
  size?: "small" | "medium" | "large";
}

const Logo: FC<LogoProps> = ({ animated = false, size = "medium" }) => (
  <svg
    viewBox="0 0 286 39"
    xmlns="http://www.w3.org/2000/svg"
    className={classNames({
      "h-8": size === "large",
      "h-5": size === "medium",
      "h-4": size === "small",
    })}
  >
    <motion.path
      initial={{ opacity: animated ? 0 : 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, yoyo: Infinity, ease: "easeInOut" }}
      d="M.898 1.793v7.21h8.917V38h7.3V9.003h8.895v-7.21H.898zm28.256-.09v36.342h21.832v-7.233H36.432v-7.3h10.916v-7.254H36.432v-7.3h14.554V1.703H29.154zM52.784 38h7.86l2.449-5.503H75.49L77.94 38h7.884L69.292 1.052 52.783 38zm13.184-11.927l3.346-7.659 3.302 7.66h-6.648zM88.99.94V38h7.278V22.996l10.466 14.42 10.445-14.42V38h7.277V.94l-17.722 24.325L88.99.939zm39.981 0V38h7.277V22.996l10.467 14.42 10.444-14.42V38h7.278V.94l-17.722 24.325L128.971.939zM167.604 38h7.861l2.448-5.503h12.399L192.76 38h7.884L184.112 1.052 167.604 38zm13.184-11.927l3.347-7.659 3.302 7.66h-6.649zm23.023-24.28V38h7.254V22.816L221.622 38h8.85l-12.444-17.811 10.714-18.396h-8.4l-9.277 16.015V1.793h-7.254zm29.828-.09v36.342h21.832v-7.233h-14.555v-7.3h10.916v-7.254h-10.916v-7.3h14.555V1.703h-21.832zM258.615 38h7.278V21.985L276.292 38h8.895l-8.423-13.117c2.066-.809 3.077-1.55 4.335-3.347 1.527-2.156 2.291-4.447 2.291-6.895v-.944c0-3.998-1.281-5.997-3.482-8.22-2.201-2.157-5.458-3.684-9.478-3.684h-11.815V38zm12.511-18.98H268.7v-.022h-2.807V9.003h4.087c1.752 0 3.527.539 4.493 1.437.943 1.011 1.437 2.18 1.437 3.504 0 2.74-2.134 5.076-4.784 5.076z"
      className="fill-current text-white dark:text-gray-300"
    />
  </svg>
);

export default Logo;
