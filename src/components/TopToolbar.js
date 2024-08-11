import React, { useState, useEffect } from 'react';
import { MetaMask } from './MetaMask';
import RewardsDropdown from './RewardsDropdown';
import EmailFormModal from './EmailFormModal';
import BottomToolbar from './BottomToolbar';
import Balances from './Balances';
import Miner from './Miner'; // Import the Miner component
import '../styles/Toolbar.css';

const TopToolbar = ({
  onConnectSmartHome,
  setWalletAddress,
  setNetworkName,
  walletAddress,
  networkName,
  formattedAddress,
  setFormattedAddress,
  selectedAccount,
  setSelectedAccount
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isMinerHigh, setIsMinerHigh] = useState(false);
  const [mintMeBalance, setMintMeBalance] = useState(0);
  const [dshBalance, setDshBalance] = useState(0);

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
      const response = await fetch('http://localhost:3330/api/submit-email', {
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

  const setupWeb3Storage = async () => {
    try {
      const response = await fetch('http://localhost:3330/api/setup-web3storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to set up web3.storage');
      }

      const { storageDid } = await response.json();
      console.log('web3.storage setup successfully, storageDid:', storageDid);
    } catch (error) {
      console.error('Error setting up web3.storage:', error);
    }
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
        <div id="formattedAddress">
          {formattedAddress}
        </div>
        <div className="miner-switch-and-balances">
          <Miner isMinerHigh={isMinerHigh} setIsMinerHigh={setIsMinerHigh} />
          <Balances 
            walletAddress={walletAddress} 
            setMintMeBalance={setMintMeBalance} 
            setDshBalance={setDshBalance} 
            mintMeBalance={mintMeBalance} 
            dshBalance={dshBalance} 
          />
        </div>
        <MetaMask 
          setWalletAddress={setWalletAddress} 
          setNetworkName={setNetworkName} 
          setFormattedAddress={setFormattedAddress} 
          setSelectedAccount={setSelectedAccount}
        />
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