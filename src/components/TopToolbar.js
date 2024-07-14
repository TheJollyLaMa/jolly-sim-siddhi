import React, { useState } from 'react';
import MetaMask from './MetaMask';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import '../styles/Toolbar.css';
import ToggleSwitch from './ToggleSwitch';
import EmailFormModal from './EmailFormModal';
import BottomToolbar from './BottomToolbar'; // Import BottomToolbar component

const TopToolbar = ({ onConnectSmartHome, setWalletAddress, setNetworkName, walletAddress }) => {
  const [switchStates, setSwitchStates] = useState({
    'Coordinate Form': false,
    'Energy Type/Usage': false,
    'Internet and Computing Capabilities': false,
    'World Seed Bank Program': false,
    'FunGus Program': false,
    'Harvest To Market': false,
    'Good Husbands Animal Care': false,
    'Local Compost Program': false,
    'Precious Plastics': false,
    'Metalurgy': false,
    'Glass': false,
    'Body Stats with Honors': false,
    'Diet Stats with Honors': false,
    'Medical Record Data': false,
    'IPFS Pin Time': false,
    'Email & Contact Form': false,
    'Social Media Rewards': false,
    'Service Rewards': false
  });
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleToggle = (name) => {
    setSwitchStates(prevState => ({
      ...prevState,
      [name]: !prevState[name]
    }));
  };

  const handleEmailFormOpen = () => {
    setShowEmailForm(true);
  };

  const handleEmailFormClose = () => {
    setShowEmailForm(false);
  };

  const handleEmailSubmit = async (email) => {
    try {
      const response = await fetch('http://localhost:3330/submit-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email submitted successfully:', data);
      handleEmailFormClose();
    } catch (error) {
      console.error('Error submitting email:', error);
    }
  };

  const renderMenuItem = (name) => (
    <Dropdown.Item onClick={name === 'Email & Contact Form' ? handleEmailFormOpen : () => onConnectSmartHome(name)}>
      <div className="dropdown-item-content">
        <span className="dropdown-item-text">{name}</span>
        <div className="dropdown-item-controls">
          <ToggleSwitch
            id={name}
            checked={switchStates[name]}
            onChange={() => handleToggle(name)}
          />
          <div className="reward-tally">
            <img src="/assets/DecentSmartHome.png" alt="Reward Icon" />
            <span>0.00</span>
          </div>
        </div>
      </div>
    </Dropdown.Item>
  );

  return (
    <>
      <div className="toolbar">
        <DropdownButton
          id="connectSmartHomeDropdown"
          title={
            <span>
              <img src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="House Icon" />
              Connect Smart Home
            </span>
          }
          menuAlign="right"
          drop="down"
        >
          <div className="scrollable-menu" style={{ zIndex: 2000, position: 'relative' }}>
            {renderMenuItem('IPFS Pin Time')}
            <Dropdown.Divider />
            {renderMenuItem('Email & Contact Form')}
            <Dropdown.Divider />
            {renderMenuItem('Coordinate Form')}
            <Dropdown.Divider />
            <Dropdown.Header>Energy Report</Dropdown.Header>
            {renderMenuItem('Energy Type/Usage')}
            {renderMenuItem('Internet and Computing Capabilities')}
            <Dropdown.Divider />
            <Dropdown.Header>Food Forest Steward</Dropdown.Header>
            {renderMenuItem('World Seed Bank Program')}
            {renderMenuItem('FunGus Program')}
            {renderMenuItem('Harvest To Market')}
            {renderMenuItem('Good Husbands Animal Care')}
            <Dropdown.Divider />
            <Dropdown.Header>WasteMan</Dropdown.Header>
            {renderMenuItem('Local Compost Program')}
            {renderMenuItem('Precious Plastics')}
            {renderMenuItem('Metalurgy')}
            {renderMenuItem('Glass')}
            <Dropdown.Divider />
            <Dropdown.Header>HealthMan</Dropdown.Header>
            {renderMenuItem('Body Stats with Honors')}
            {renderMenuItem('Diet Stats with Honors')}
            {renderMenuItem('Medical Record Data')}
            <Dropdown.Divider />
            <Dropdown.Header>Social Media Rewards</Dropdown.Header>
            {renderMenuItem('Social Media Rewards')}
            <Dropdown.Divider />
            <Dropdown.Header>Service Rewards</Dropdown.Header>
            {renderMenuItem('Service Rewards')}
          </div>
        </DropdownButton>
        <span id="walletAddress">{walletAddress}</span>
        <MetaMask setWalletAddress={setWalletAddress} setNetworkName={setNetworkName} />
        <EmailFormModal
          show={showEmailForm}
          onHide={handleEmailFormClose}
          onSubmit={handleEmailSubmit}
        />
      </div>
      <BottomToolbar walletAddress={walletAddress} /> {/* Pass walletAddress to BottomToolbar */}
    </>
  );
};

export default TopToolbar;