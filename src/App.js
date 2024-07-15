import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    initWeb3(setWalletAddress, setNetworkName);
    initSocket();
  }, []);

  const handleConnectSmartHome = () => {
    // Implement the logic to connect smart home
  };

  return (
    <div className="App">
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
    </div>
  );
}

export default App;