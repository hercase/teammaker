interface Props {
  value: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  id: string;
  disabled?: boolean;
  title: string;
  size: string;
}

const ToggleSwitch = ({ value, checked, onChange, name, id, disabled, title, size = "lg" }: Props) => {
  return ToggleSwitch;
};

export default ToggleSwitch;
