import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Toolbar.css'; // Ensure you have the necessary styles

const BottomToolbar = ({ walletAddress }) => {
  const [showInput, setShowInput] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc'; // Replace with your specific wallet address

  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3330/api/transcribe', { url: youtubeLink }); // Updated endpoint
      console.log('Transcription complete! The file has been saved.');
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Wallet address:', walletAddress);
  }, [walletAddress]);

  const isCorrectWallet = walletAddress && typeof walletAddress === 'string' && walletAddress.toLowerCase() === correctWalletAddress.toLowerCase();
  console.log('Is correct wallet:', isCorrectWallet);

  return (
    <div id="bottomToolbar">
      <div id="bottomArrow" className="arrow" onClick={() => window.location.href='bottomPage.html'}>
        <span>&darr;</span>
      </div>
      {isCorrectWallet && (
        <div className="youtube-section">
          {!showInput && (
            <img
              src="/assets/Youtube_Logo.png"
              alt="YouTube"
              className="youtube-logo"
              onClick={() => {
                console.log('YouTube logo clicked');
                setShowInput(true);
              }}
              style={{ cursor: 'pointer' }} // Ensure the cursor indicates clickable
            />
          )}
          {showInput && (
            <div className="youtube-input-container">
              <input
                type="text"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="Enter YouTube link"
                className="youtube-input"
              />
              <button onClick={handleTranscribe} disabled={isLoading || !youtubeLink} className="transcribe-button">
                {isLoading ? 'Transcribing...' : 'Transcribe'}
              </button>
              {isLoading && <div className="loading-spinner">Loading...</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BottomToolbar;