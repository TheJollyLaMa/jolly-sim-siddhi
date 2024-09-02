import React from 'react';

const ChatIcons = ({ setShowSimSiddhiChat, setShowDoctorBuddhaChat, setShowWotserWellChat }) => {
  return (
    <div className="chat-icons">
      <img
        src="https://bafybeia7dr3aeh53mmqxnpwfga2zflp2u6msvwih4iiziwrfxct5ti4of4.ipfs.w3s.link/SimSiddhiChat.png"
        alt="Chat Icon"
        className="chat-icon"
        onClick={() => setShowSimSiddhiChat(prev => !prev)}
        style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
      />
      <img
        src="https://bafybeid6y5ibkrn2y7ddkolpzo53i7rbdbjxscmivbrmq4vtrapnl6l5wa.ipfs.w3s.link/DoctorBuddha.png"
        alt="Doctor Buddha Icon"
        className="doctor-buddha-icon"
        onClick={() => setShowDoctorBuddhaChat(prev => !prev)}
        style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
      />
      <img
        src="https://bafybeidpjh43gomls6rkxym4cbetd6cufc7y3uhplgo5ur7ufjeg5fdghi.ipfs.w3s.link/WOTSERWell.jpeg"
        alt="WotserWell Icon"
        className="wotser-well-icon"
        onClick={() => setShowWotserWellChat(prev => !prev)}
        style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
      />
    </div>
  );
};

export default ChatIcons;