import classNames from "classnames";
import { FC } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  variant = "primary",
  disabled,
  className,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const btnClasses = classNames(
    "button px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors duration-300 ease-in-out touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400",
    className,
    {
      "bg-primary-700 hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-900": variant === "primary",
      "bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-800":
        variant === "secondary",
      "bg-error-600 hover:bg-error-700 dark:bg-error-700 dark:hover:bg-error-800": variant === "danger",
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
