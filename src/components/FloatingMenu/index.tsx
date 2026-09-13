import classNames from "classnames";
import { FC, useState } from "react";
import { useLayer } from "react-laag";

interface FloatingMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  label: string;
}

const FloatingMenu: FC<FloatingMenuProps> = ({ trigger, children, className, label }) => {
  const [isOpen, setOpen] = useState(false);

  // helper function to close the menu
  function close() {
    setOpen(false);
  }

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    onOutsideClick: close,
    onDisappear: close,
    overflowContainer: false,
    auto: true,
    placement: "bottom-end",
    triggerOffset: 2,
    containerOffset: 16,
  });

  return (
    <>
      <button
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        {...triggerProps}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger}
      </button>
      {renderLayer(
        <>
          {isOpen && (
            <ul
              className="panel z-30 overflow-hidden text-text shadow-xl shadow-black/40"
              {...layerProps}
            >
              {children}
            </ul>
          )}
        </>
      )}
    </>
  );
};

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

const MenuOption: FC<MenuOptionProps> = ({ icon, label, disabled, onClick }) => (
  <li
    className={classNames(
      "flex min-h-11 items-center gap-2 px-5 text-sm leading-6 text-text border-b border-border last-of-type:border-none cursor-pointer transition-colors hover:bg-surface-hover",
      {
        "opacity-50 cursor-not-allowed": disabled,
      }
    )}
    onClick={() => !disabled && onClick?.()}
  >
    {icon}
    {label}
  </li>
);

export { MenuOption };
export default FloatingMenu;
