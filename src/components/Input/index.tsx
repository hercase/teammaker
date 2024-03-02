import { FC } from "react";
import PropTypes from "prop-types";

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: FC<InputProps> = ({ label, value, onChange }) => {
  return (
    <div className="label">
      <label>{label}</label>
      <div className="mt-1">
        <input className="input" value={value} onChange={onChange} />
      </div>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.any,
};

export default Input;
