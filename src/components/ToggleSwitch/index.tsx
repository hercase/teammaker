import { FC } from "react";
import { Switch } from "@headlessui/react";
import classNames from "classnames";

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ checked, disabled, onChange }) => (
  <Switch
    disabled={disabled}
    checked={checked}
    onChange={onChange}
    className={classNames(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out",
      checked ? "bg-primary-600 border-primary-500" : "bg-surface-raised border-border-strong"
    )}
  >
    <span className="sr-only">Lista aleatoria</span>
    <span
      aria-hidden="true"
      className={classNames(
        checked ? "translate-x-[21px]" : "translate-x-[1px]",
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out translate-y-[1px] "
      )}
    />
  </Switch>
);

export default ToggleSwitch;
