"use client";

import { FC, ReactNode } from "react";
import classNames from "classnames";
import { Button as HeroButton } from "@heroui/react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

/*
  A thin wrapper over HeroUI's Button rather than a replacement of it at every call site.

  Fifteen places already say variant="ghost" and onClick, and translating each of them by hand is
  fifteen chances to change behaviour by accident. The names this app uses stay; the mapping to
  HeroUI's own vocabulary happens once, here.

  "ghost" is HeroUI's "outline": transparent with a border. HeroUI's own "ghost" has no border at
  all, which is not what any of these call sites mean.

  That outline is redrawn here. HeroUI hands it --border, the same token its panels use, and on this
  theme that measured 1.07:1 against the box behind it — a button nobody could see was a button.
  Structural edges are allowed to be quiet; the boundary of something you press is not, and WCAG
  1.4.11 puts the floor at 3:1. --color-border-strong at 60% is the first step that clears 3:1 on all
  three grounds an outline button sits on here — the page, a panel and the list box — measured by
  compositing the alpha over each rather than trusting the swatch.

  The size is HeroUI's "lg", and nothing here overrides a height. Every button in this app is
  something you tap with a thumb, so 44px is the floor — and lg is 44px exactly, which is the whole
  point of the library having a scale. What was here before forced min-h-12 on top of md: a 48px box
  around 14px text, which read as a button with too much air in it rather than a bigger button. lg
  is shorter *and* sets its text to 16px, so the proportion comes out right instead of stretched.

  There was a size prop too, offering "sm". No call site ever passed it.
*/
const VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
  ghost: "outline",
} as const;

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  variant = "primary",
  disabled,
  className,
  onClick,
  "aria-label": ariaLabel,
}) => (
  <HeroButton
    type={type}
    variant={VARIANTS[variant]}
    size="lg"
    isDisabled={disabled}
    className={classNames({ "border-border-strong/60": variant === "ghost" }, className)}
    onPress={onClick}
    aria-label={ariaLabel}
  >
    {children}
  </HeroButton>
);

export default Button;
