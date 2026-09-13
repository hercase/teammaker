import classNames from "classnames";
import { FC } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  variant = "primary",
  size = "md",
  disabled,
  className,
  onClick,
  "aria-label": ariaLabel,
}) => {
  /*
    Size belongs to the component, not to the caller. Every call site that reached for its own
    px-3 or h-9 was one more way for two buttons in the same app to stop matching.
  */
  const btnClasses = classNames(
    "rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors touch-manipulation active:scale-[0.98]",
    { "min-h-11 px-5": size === "md", "min-h-9 px-3 text-sm": size === "sm" },
    className,
    {
      "bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-950/50": variant === "primary",
      "bg-secondary-700 hover:bg-secondary-600": variant === "secondary",
      "bg-error-600 hover:bg-error-500": variant === "danger",
      "bg-transparent border border-border-strong text-text hover:bg-surface-hover": variant === "ghost",
      "pointer-events-none opacity-50": disabled,
    }
  );

  return (
    <button type={type} className={btnClasses} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
};

export default Button;
