import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from './DropdownItem';
import '../styles/Toolbar.css';

const RewardsDropdown = ({ walletConnected, setupWeb3Storage, handleEmailFormOpen, onConnectSmartHome }) => {
  const [switchStates, setSwitchStates] = useState({
    'Coordinate Form': false,
    'Land Survey': false,
    'Water Survey': false,
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
  const [rewards, setRewards] = useState({});

  useEffect(() => {
    // Fetch reward rates
    fetch('http://localhost:3330/api/rewards')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setRewards(data))
      .catch(error => {
        console.error('Error fetching rewards:', error);
        // Add logging to see the response text
        fetch('http://localhost:3330/api/rewards')
          .then(response => response.text())
          .then(text => console.log('Response text:', text))
          .catch(err => console.error('Error fetching response text:', err));
      });
  }, []);

  const handleToggle = (name) => {
    setSwitchStates(prevState => ({
      ...prevState,
      [name]: !prevState[name]
    }));
  };

  const renderMenuItem = (name) => (
    <DropdownItem 
      name={name} 
      checked={switchStates[name]} 
      onToggle={() => handleToggle(name)} 
      reward={rewards[name]} 
      onClick={name === 'Email & Contact Form' ? handleEmailFormOpen : () => onConnectSmartHome(name)} 
    />
  );

  return (
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
      disabled={!walletConnected} // Disable button if wallet is not connected
      onClick={setupWeb3Storage} // Call setupWeb3Storage when the button is clicked
    >
      <div className="scrollable-menu" style={{ zIndex: 2000, position: 'relative' }}>
        {renderMenuItem('IPFS Pin Time')}
        <Dropdown.Divider />
        {renderMenuItem('Email & Contact Form')}
        <Dropdown.Divider />
        {renderMenuItem('Coordinate Form')}
        {renderMenuItem('Land Survey')} {/* Added Land Survey under Coordinate Form */}
        {renderMenuItem('Water Survey')}
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
  );
};

export default RewardsDropdown;