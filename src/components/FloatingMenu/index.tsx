"use client";

import { FC, ReactNode } from "react";
import { Button, Dropdown, Label } from "@heroui/react";

interface FloatingMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
  // Marks the trigger out of the shared picture: it is a control, and the picture is not.
  "data-share"?: string;
}

/*
  HeroUI's Dropdown, which is React Aria's menu underneath.

  What this replaces is worth naming, because it was all written by hand here: the menu rendered
  through a portal, so Tab from the trigger walked past it into the next player and focus had to be
  moved in manually; Escape had to be caught and focus handed back to the row; picking an option had
  to close the menu explicitly; and the options were clickable list items, which take no focus, no
  Enter and no Space. React Aria does all of that, and does it the same way on every menu.
*/
const FloatingMenu: FC<FloatingMenuProps> = ({ trigger, children, className, label, ...rest }) => (
  <Dropdown>
    {/*
      The trigger has to be HeroUI's Button — a plain <button> is not wired to the Dropdown and the
      menu simply never opens. The row is styled by this app, though, so `render` hands the press
      behaviour to our own element instead of accepting theirs.
    */}
    <Button aria-label={label} render={(props) => <button {...props} {...rest} className={className} />}>
      {trigger}
    </Button>
    <Dropdown.Popover>
      <Dropdown.Menu aria-label={label}>{children}</Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
);

interface MenuOptionProps {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

const MenuOption: FC<MenuOptionProps> = ({ icon, label, disabled, onClick }) => (
  <Dropdown.Item
    isDisabled={disabled}
    textValue={label}
    onAction={onClick}
    className="min-h-11 gap-2"
  >
    {icon}
    <Label>{label}</Label>
  </Dropdown.Item>
);

export { MenuOption };
export default FloatingMenu;
