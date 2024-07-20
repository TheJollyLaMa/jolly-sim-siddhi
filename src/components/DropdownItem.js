import React from 'react';
import { Dropdown } from 'react-bootstrap';  // Add this import
import ToggleSwitch from './ToggleSwitch';
import '../styles/Toolbar.css';

const DropdownItem = ({ name, checked, onToggle, reward, onClick }) => (
  <Dropdown.Item onClick={onClick}>
    <div className="dropdown-item-content">
      <span className="dropdown-item-text">{name}</span>
      <div className="dropdown-item-controls">
        <ToggleSwitch
          id={name}
          checked={checked}
          onChange={onToggle}
        />
        <div className="reward-tally">
          <img src="/assets/DecentSmartHome.png" alt="Reward Icon" />
          <span>{reward?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  </Dropdown.Item>
);

export default DropdownItem;