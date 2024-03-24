import { FC } from "react";

interface ColorPickerProps {
  label: string;
  color?: string;
  onChange?: (color: string) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ label, color, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer">
    <span className="label">{label}</span>
    <div className="relative block w-7 h-7 rounded-lg border border-gray-300" style={{ backgroundColor: color }}>
      <input
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        type="color"
        value={color}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  </label>
);

export default ColorPicker;
