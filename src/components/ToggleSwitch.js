import React from 'react';
import '../styles/ToggleSwitch.css';

const ToggleSwitch = ({ id, checked, onChange }) => {
  return (
    <div className="toggle-switch">
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
      />
      <label className="toggle-switch-label" htmlFor={id}>
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </label>
    </div>
  );
};

export default ToggleSwitch;
