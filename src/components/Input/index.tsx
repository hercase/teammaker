import { FC } from "react";
import PropTypes from "prop-types";

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: FC<InputProps> = ({ label, value, onChange }) => {
  return (
    <div className="font-normal text-sm text-gray-400 flex-1">
      <label>{label}</label>
      <div className="mt-1">
        <input className="border-gray-300 rounded-md w-full h-8" value={value} onChange={onChange} />
      </div>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.any,
};

export default Input;
