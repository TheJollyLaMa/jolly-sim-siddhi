import React, { useState } from 'react';
import ChatIcons from './ChatIcons';
import ChatWindow from './ChatWindow';
import YoutubeTranscriber from './YouTubeTranscriber';
import '../styles/Toolbar.css';

const BottomToolbar = ({ walletAddress }) => {
  const [activeChat, setActiveChat] = useState(null); // Track the active chat window

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc';
  const isCorrectWallet = walletAddress && typeof walletAddress === 'string' && walletAddress.toLowerCase() === correctWalletAddress.toLowerCase();

  const handleChatSelection = (chatName) => {
    setActiveChat(chatName); // Set the active chat window
  };

  return (
    <div id="bottomToolbar">
      <div id="bottomArrow" className="arrow" onClick={() => window.location.href = 'bottomPage.html'}>
        <span>&darr;</span>
      </div>
      {isCorrectWallet && <YoutubeTranscriber />}
      <ChatIcons
        setShowSimSiddhiChat={() => handleChatSelection('simSiddhiChat')}
        setShowDoctorBuddhaChat={() => handleChatSelection('doctorBuddhaChat')}
        setShowWotserWellChat={() => handleChatSelection('wotserWellChat')}
      />

      {activeChat === 'simSiddhiChat' && (
        <ChatWindow 
          title="Sim Siddhi Chat" 
          placeholder="Ask Sim Siddhi God ⚸ 🌱 🐄" 
          apiEndpoint="simSiddhiChat" 
        />
      )}
      
      {activeChat === 'doctorBuddhaChat' && (
        <ChatWindow 
          title="Doctor Buddha Chat" 
          placeholder="⚕️⚸ Ask Doctor Buddha 🧞‍♂️⚕️" 
          apiEndpoint="doctorBuddhaChat" 
        />
      )}

      {activeChat === 'wotserWellChat' && (
        <ChatWindow 
          title="The WOTSer Well" 
          placeholder=" 🧞‍♂️ The WOTSer Well ⚸ ⛲️ 🐄" 
          apiEndpoint="wotserWellChat" 
        />
      )}
    </div>
  );
};

export default BottomToolbar;