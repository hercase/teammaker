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
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-gray-700 dark:border-gray-700 transition-colors duration-200 ease-in-out focus:outline-hidden ring-0",
      checked ? "bg-primary-600" : "bg-gray-400 dark:bg-gray-8b00"
    )}
  >
    <span className="sr-only">Use setting</span>
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
