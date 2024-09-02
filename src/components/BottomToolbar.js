import React, { useState } from 'react';
import ChatIcons from './ChatIcons';
import ChatWindow from './ChatWindow';
import YoutubeTranscriber from './YouTubeTranscriber';
import '../styles/Toolbar.css';

const BottomToolbar = ({ walletAddress }) => {
  const [showSimSiddhiChat, setShowSimSiddhiChat] = useState(false);
  const [showDoctorBuddhaChat, setShowDoctorBuddhaChat] = useState(false);
  const [showWotserWellChat, setShowWotserWellChat] = useState(false);

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc';
  const isCorrectWallet = walletAddress && typeof walletAddress === 'string' && walletAddress.toLowerCase() === correctWalletAddress.toLowerCase();

  return (
    <div id="bottomToolbar">
      <div id="bottomArrow" className="arrow" onClick={() => window.location.href = 'bottomPage.html'}>
        <span>&darr;</span>
      </div>
      {isCorrectWallet && <YoutubeTranscriber />}
      <ChatIcons
        setShowSimSiddhiChat={setShowSimSiddhiChat}
        setShowDoctorBuddhaChat={setShowDoctorBuddhaChat}
        setShowWotserWellChat={setShowWotserWellChat}
      />
      {showSimSiddhiChat && <ChatWindow title="Sim Siddhi Chat" placeholder="Ask Sim Siddhi God ⚸ 🌱 🐄" apiEndpoint="simSiddhiChat" />}
      {showDoctorBuddhaChat && <ChatWindow title="Doctor Buddha Chat" placeholder="⚕️⚸ Ask Doctor Buddha 🧞‍♂️⚕️" apiEndpoint="doctorBuddhaChat" />}
      {showWotserWellChat && <ChatWindow title="The WOTSer Well" placeholder=" 🧞‍♂️ The WOTSer Well ⚸ ⛲️ 🐄" apiEndpoint="wotserWellChat" />}
    </div>
  );
};

export default BottomToolbar;