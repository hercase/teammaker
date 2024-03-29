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
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-0",
      checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
    )}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={classNames(
        checked ? "translate-x-5" : "translate-x-0",
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      )}
    />
  </Switch>
);

export default ToggleSwitch;
