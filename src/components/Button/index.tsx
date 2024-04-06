import classNames from "classnames";
import { FC } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  small?: boolean;
  className?: string;
  onClick?: () => void;
};

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  variant = "primary",
  disabled,
  small,
  className,
  onClick,
}) => {
  const btnClasses = classNames(
    "button px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors duration-300 ease-in-out",
    className,
    {
      "text-sm px-3 py-1.5": small,
      "bg-primary-600 hover:bg-primary-700  ": variant === "primary",
      "bg-secondary-500 hover:bg-secondary-600  ": variant === "secondary",
      "bg-red-600 hover:bg-red-700  ": variant === "danger",
      "pointer-events-none opacity-50": disabled,
    }
  );

  return (
    <button type={type} className={btnClasses} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
