import React, { useState, useEffect } from 'react';
import TipPopup from './components/TipPopup';
import TopToolbar from './components/TopToolbar';
import BottomToolbar from './components/BottomToolbar';
import LeftToolbar from './components/LeftToolbar';
import RightToolbar from './components/RightToolbar';
import ThreeScene from './components/ThreeScene';
import { initWeb3, initSocket } from './services/init';
import './styles/App.css';
import './styles/Toolbar.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('No wallet connected');
  const [networkName, setNetworkName] = useState('Connect Wallet');
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    initWeb3(setWalletAddress, setNetworkName);
    initSocket();
  }, []);

  const handleConnectSmartHome = () => {
    // Implement the logic to connect smart home
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="App">
      {showPopup && <TipPopup onClose={handleClosePopup} />}
      {!showPopup && (
        <>
          <TopToolbar
            onConnectSmartHome={handleConnectSmartHome}
            setWalletAddress={setWalletAddress}
            setNetworkName={setNetworkName}
            networkName={networkName}
            walletAddress={walletAddress}
          />
          <ThreeScene />
          <BottomToolbar walletAddress={walletAddress} /> {/* Pass walletAddress here */}
          <LeftToolbar />
          <RightToolbar />
        </>
      )}
    </div>
  );
}

export default App;