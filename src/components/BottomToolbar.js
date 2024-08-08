import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Toolbar.css'; 

const BottomToolbar = ({ walletAddress }) => {
  const [showInput, setShowInput] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);  
  const [chatInput, setChatInput] = useState('');  
  const [chatMessages, setChatMessages] = useState([]);  

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc'; 

  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3330/api/transcribe', { url: youtubeLink }); 
      console.log('Transcription complete! The file has been saved.');
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) {
      console.error('Empty prompt. Please enter a valid message.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3330/api/chat', { prompt: chatInput });
      if (response.status === 200) {
        setChatMessages([...chatMessages, { text: chatInput, isUser: true }, { text: response.data.text, isUser: false }]);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error sending message to chat:', error);
      console.log('Full error details:', error.response);
    } finally {
      setChatInput('');
      setIsLoading(false);
    }
  };

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
              style={{ cursor: 'pointer' }} 
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
      <img
        src="https://bafybeia7dr3aeh53mmqxnpwfga2zflp2u6msvwih4iiziwrfxct5ti4of4.ipfs.w3s.link/SimSiddhiChat.png" // URL to your chat icon
        alt="Chat Icon"
        className="chat-icon"
        onClick={() => setShowChat(!showChat)}
        style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
      
      />
      {showChat && (
        <div className="chat-window">
          <div className="messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
            placeholder="Ask Sim Siddhi God..."
            className="chat-input"
          />
          <button onClick={handleChatSubmit} className="send-button">
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomToolbar;