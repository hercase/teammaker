import classNames from "classnames";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { useLayer } from "react-laag";

interface FloatingMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  label: string;
}

// react-laag hands back its own ref for each element, so ours has to ride alongside it.
const mergeRefs =
  <T,>(laagRef: unknown, own: MutableRefObject<T | null>) =>
  (node: T | null) => {
    own.current = node;

    if (typeof laagRef === "function") laagRef(node);
    else if (laagRef) (laagRef as MutableRefObject<T | null>).current = node;
  };

const FloatingMenu: FC<FloatingMenuProps> = ({ trigger, children, className, label }) => {
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    onOutsideClick: () => setOpen(false),
    onDisappear: () => setOpen(false),
    overflowContainer: false,
    auto: true,
    placement: "bottom-end",
    triggerOffset: 2,
    containerOffset: 16,
  });

  /*
    The menu is rendered through a portal, so it sits at the end of the document and Tab from the
    trigger walks straight past it into the next player. Focus is moved in by hand when it opens,
    and Escape puts it back on the row that opened it — otherwise focus falls to the top of the
    document, which on a list of twelve players means tabbing all the way back down.

    The control announced itself with aria-haspopup long before any of this worked.
  */
  useEffect(() => {
    if (!isOpen) return;

    menuRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        {...triggerProps}
        ref={mergeRefs<HTMLButtonElement>(triggerProps.ref, triggerRef)}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger}
      </button>
      {renderLayer(
        <>
          {isOpen && (
            <ul
              role="menu"
              aria-label={label}
              /*
                Picking an option closes the menu. It used to stay open underneath whatever dialog
                the option had just opened, and was still sitting there when the dialog was
                dismissed. Focus is left alone here: the dialog wants it.
              */
              onClick={() => setOpen(false)}
              className="panel z-30 overflow-hidden text-text shadow-xl shadow-black/40"
              {...layerProps}
              ref={mergeRefs<HTMLUListElement>(layerProps.ref, menuRef)}
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

/*
  A button inside the li, not a clickable li. A bare li takes no focus, no Enter and no Space, so
  the one control on this branch that promised a menu was the one control a keyboard could not use.

  The divider belongs to the li: each button is the only one of its type inside its own li, so
  last-of-type on the button matches every one of them and leaves no dividers at all.
*/
const MenuOption: FC<MenuOptionProps> = ({ icon, label, disabled, onClick }) => (
  <li role="none" className="border-b border-border last-of-type:border-none">
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => onClick?.()}
      className={classNames(
        "flex min-h-11 w-full items-center gap-2 px-5 text-left text-sm leading-6 text-text transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400",
        { "cursor-not-allowed opacity-50": disabled }
      )}
    >
      {icon}
      {label}
    </button>
  </li>
);

export { MenuOption };
export default FloatingMenu;
