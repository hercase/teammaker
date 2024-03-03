import classNames from "classnames";
import { FC } from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const Button: FC<ButtonProps> = ({ type = "button", children, variant = "primary", disabled, className, onClick }) => {
  const btnClasses = classNames(
    "button px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors duration-300 ease-in-out",
    className,
    {
      "bg-primary-500 hover:bg-primary-600": variant === "primary",
      "bg-secondary-500 hover:bg-secondary-600": variant === "secondary",
      "bg-red-700 hover:bg-red-800": variant === "danger",
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
