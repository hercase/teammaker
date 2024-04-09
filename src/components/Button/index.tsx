import classNames from "classnames";
import { FC } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "terciary" | "danger";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const Button: FC<ButtonProps> = ({ type = "button", children, variant = "primary", disabled, className, onClick }) => {
  const btnClasses = classNames(
    "button px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors duration-300 ease-in-out",
    className,
    {
      "bg-primary-600 hover:bg-primary-700  ": variant === "primary",
      "bg-secondary-600 hover:bg-secondary-700  ": variant === "secondary",
      "bg-terciary-600 hover:bg-terciary-700  ": variant === "terciary",
      "bg-red-700 hover:bg-red-800  ": variant === "danger",
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
