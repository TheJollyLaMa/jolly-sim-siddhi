import React, { useState, useEffect } from 'react';
import { MetaMask } from './MetaMask';
import RewardsDropdown from './RewardsDropdown';
import EmailFormModal from './EmailFormModal';

import BottomToolbar from './BottomToolbar';
import RightToolbar from './RightToolbar'; // Import RightToolbar

import Balances from './Balances_ERC';
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
  const [ethBalance, setEthBalance] = useState(0);
  const [polBalance, setPolBalance] = useState(0);
  const [mintMeBalance, setMintMeBalance] = useState(0);
  const [shtBalance, setShtBalance] = useState(0);
  const [dshBalance, setDshBalance] = useState(0);
  const [arbitrageData, setArbitrageData] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const runArbitrageBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3330/api/arbitrage', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run arbitrage bot');
      }

      const data = await response.json();
      setArbitrageData(data);
    } catch (error) {
      console.error('Error running arbitrage bot:', error);
    } finally {
      setLoading(false);
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
        <img
    src="https://bafybeihx7bjavlb6uicr4d3osgrduatte3jtsfrfs2exrymmauw4dbgwvm.ipfs.w3s.link/SimSiddhiDefi.png"
    alt="Sim Siddhi Defi Icon"
    className="arbitrage-button"
    onClick={() => runArbitrageBot()} // Replace with your function
    style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
/>
        <div className="miner-switch-and-balances">
          <Miner isMinerHigh={isMinerHigh} setIsMinerHigh={setIsMinerHigh} />
          <Balances 
            walletAddress={walletAddress} 
            setEthBalance={setEthBalance}
            setPolBalance={setPolBalance}
            setMintMeBalance={setMintMeBalance} 
            setShtBalance={setShtBalance}
            setDshBalance={setDshBalance}
            ethBalance={ethBalance}
            polBalance={polBalance} 
            mintMeBalance={mintMeBalance}
            shtBalance={shtBalance} 
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

      {loading && <div className="loading">Loading...</div>}

      {arbitrageData && (
        <div className="arbitrage-results">
          <h3>Arbitrage Results</h3>
          <pre>{JSON.stringify(arbitrageData, null, 2)}</pre>
        </div>
      )}


      <BottomToolbar walletAddress={walletAddress} /> {/* Pass walletAddress to BottomToolbar */}
      <RightToolbar walletAddress={walletAddress} /> {/* Pass walletAddress to RightToolbar */}
    </>
  );
};

export default TopToolbar;