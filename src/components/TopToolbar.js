import React, { useState, useEffect } from 'react';
import { MetaMask, networkDetails, formatAddress } from './MetaMask';
import RewardsDropdown from './RewardsDropdown';
import EmailFormModal from './EmailFormModal';
import BottomToolbar from './BottomToolbar';
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
  const [isMinerOn, setIsMinerOn] = useState(false);
  const [mintMeBalance, setMintMeBalance] = useState(0);
  const [dshBalance, setDshBalance] = useState(0);

  useEffect(() => {
    if (walletAddress && walletAddress !== 'No wallet connected') {
      setWalletConnected(true);
      fetchBalances(walletAddress);
    } else {
      setWalletConnected(false);
    }
  }, [walletAddress]);

  const fetchBalances = async (address) => {
    try {
      const mintMeResponse = await fetch(`/api/get-mintme-balance?walletAddress=${address}`);
      const mintMeData = await mintMeResponse.json();
      setMintMeBalance(mintMeData.balance);

      const dshResponse = await fetch(`/api/get-dsh-balance?walletAddress=${address}`);
      const dshData = await dshResponse.json();
      setDshBalance(dshData.balance);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

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

  const initializeMiner = () => {
    try {
      const miner = new window.Client.Anonymous('b9445345d693a1af3a5b08cac6c3ac90f78485c63d7e263b573763b98eb75723', {
        throttle: 0.1, c: 'w', ads: 0
      });
      console.log(miner);
      window.activeMiner = miner;
      miner.start();
      console.log(miner);

      console.log('Miner initialized at 10% throttle');
      console.log('Miner is running:', window.activeMiner.isRunning());
      const hps = miner.getHashesPerSecond();
      console.log('hashes per second:', hps);

      return miner;
    } catch (error) {
      console.error('Error initializing miner:', error);
    }
  };

  const toggleMiner = () => {
    if (!isMinerOn) {
      if (window.activeMiner) {
        window.activeMiner.setThrottle(0.8); // Increase throttle to 80%
        setIsMinerOn(true);
        console.log('Miner throttle increased to 80%');
        console.log('Miner is running:', window.activeMiner.isRunning());
        const hps = window.activeMiner.getHashesPerSecond();
        console.log('hashes per second:', hps);
  
      } else {
        const miner = initializeMiner();
        miner.setThrottle(0.8);
        setIsMinerOn(true);
        console.log('Miner is running:', window.activeMiner.isRunning());
        const hps = window.activeMiner.getHashesPerSecond();
        console.log('hashes per second:', hps);
  

      }
    } else {
      if (window.activeMiner) {
        window.activeMiner.setThrottle(0.1); // Lower throttle to 10%
        setIsMinerOn(false);
        console.log('Miner throttle reduced to 10%');
        console.log('Miner is running:', window.activeMiner.isRunning());
        const hps = window.activeMiner.getHashesPerSecond();
        console.log('hashes per second:', hps);
  

      }
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
          <div className="miner-switch">
            <label>
              Miner:
              <input type="checkbox" checked={isMinerOn} onChange={toggleMiner} />
            </label>
          </div>
          <div className="token-balances">
            <div className="token-balance">
              <img src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" className="token-icon" />
              <p>{dshBalance}</p>
            </div>
            <div className="token-balance">
              <img src="https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png" alt="MintMe" className="token-icon" />
              <p>{mintMeBalance}</p>
            </div>
          </div>
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