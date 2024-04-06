"use client";

import classNames from "classnames";
import { FC, useState } from "react";
import { useLayer } from "react-laag";

interface FloatingMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FloatingMenu: FC<FloatingMenuProps> = ({ trigger, children, className }) => {
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
      <button className={className} {...triggerProps} onClick={() => setOpen(!isOpen)}>
        {trigger}
      </button>
      {renderLayer(
        <>
          {isOpen && (
            <ul
              className="bg-white text-gray-600 border border-gray-200 rounded-md shadow-lg z-10
            "
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
      "flex items-center gap-2 px-5 py-2 text-sm leading-6 text-gray-900 border-b border-gray-200 last-of-type:border-none cursor-pointer hover:bg-gray-100  ",
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
