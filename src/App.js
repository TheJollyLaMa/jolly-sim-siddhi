import React, { useState, useEffect } from 'react';
import TipPopup from './components/TipPopup';
import TopToolbar from './components/TopToolbar';
import BottomToolbar from './components/BottomToolbar';
import LeftToolbar from './components/LeftToolbar';
import RightToolbar from './components/RightToolbar';
import ThreeScene from './components/ThreeScene'; // The 3D game scene
import { initWeb3, initSocket } from './services/init';
import './styles/App.css';
import './styles/Toolbar.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('No wallet connected');
  const [networkName, setNetworkName] = useState('Connect Wallet');
  const [showPopup, setShowPopup] = useState(true);
  const [formattedAddress, setFormattedAddress] = useState('No wallet connected');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [gameOver, setGameOver] = useState(false); // Track game over state
  const [gameWin, setGameWin] = useState(false);   // Track win state

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

  // Function that gets called when the ship collides with Earth or an asteroid
  const handleGameOver = () => {
    setGameOver(true); // Update the game over state
  };

  // Function that gets called when the player destroys all asteroids
  const handleGameWin = () => {
    setGameWin(true); // Update the game win state
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
            formattedAddress={formattedAddress}
            setFormattedAddress={setFormattedAddress}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
          {/* The main game scene */}
          <ThreeScene 
            onShipCollision={handleGameOver}  // Pass game over handler
            onAsteroidCollision={handleGameWin} // Pass game win handler
          />
          <BottomToolbar walletAddress={walletAddress} /> {/* Pass walletAddress here */}
          <LeftToolbar />
          <RightToolbar />
          {/* Game over or game win messages */}
          {gameOver && <div className="game-status">Game Over! Try again.</div>}
          {gameWin && <div className="game-status">Congratulations! You Win!</div>}
        </>
      )}
    </div>
  );
}

export default App;