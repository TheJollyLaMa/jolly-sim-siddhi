import React, { useState, useEffect } from 'react';
import MetaMask from './MetaMask';
import RewardsDropdown from './RewardsDropdown';
import EmailFormModal from './EmailFormModal';
import BottomToolbar from './BottomToolbar';
import '../styles/Toolbar.css';

const TopToolbar = ({ onConnectSmartHome, setWalletAddress, setNetworkName, walletAddress }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (walletAddress && walletAddress !== 'No wallet connected') {
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
    }
  }, [walletAddress]);

  const handleEmailFormOpen = () => {
    setShowEmailForm(true);
  };

  const handleEmailFormClose = () => {
    setShowEmailForm(false);
  };

  const handleEmailSubmit = async (email) => {
    try {
      const response = await fetch('/api/setup-web3storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress, email })
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

  const setupWeb3Storage = async () => {
    setShowEmailForm(true);
  };

  return (
    <>
      <div className="toolbar">
        <RewardsDropdown 
          walletConnected={walletConnected} 
          setupWeb3Storage={setupWeb3Storage} 
          handleEmailFormOpen={handleEmailFormOpen}
          onConnectSmartHome={onConnectSmartHome}
        />
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