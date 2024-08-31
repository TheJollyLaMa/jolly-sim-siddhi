import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Toolbar.css';

const BottomToolbar = ({ walletAddress }) => {
  const [showInput, setShowInput] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showSimSiddhiChat, setShowSimSiddhiChat] = useState(false);
  const [chatSimSiddhiInput, setSimSiddhiChatInput] = useState('');
  const [chatSimSiddhiMessages, setSimSiddhiChatMessages] = useState([]);
  const [accumulatedSimSiddhiMessage, setAccumulatedSimSiddhiMessage] = useState('');

  const [showDoctorBuddhaChat, setShowDoctorBuddhaChat] = useState(false);
  const [chatDoctorBuddhaInput, setDoctorBuddhaChatInput] = useState('');
  const [chatDoctorBuddhaMessages, setDoctorBuddhaChatMessages] = useState([]);
  const [accumulatedDoctorBuddhaMessage, setAccumulatedDoctorBuddhaMessage] = useState('');

  const [showWotserWellChat, setShowWotserWellChat] = useState(false);
  const [chatWotserWellInput, setWotserWellChatInput] = useState('');
  const [chatWotserWellMessages, setWotserWellChatMessages] = useState([]);
  const [accumulatedWotserWellMessage, setAccumulatedWotserWellMessage] = useState('');

  const [vectorStoreId, setVectorStoreId] = useState('');
  const [vectorStores, setVectorStores] = useState([]);

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc';

  useEffect(() => {
    const fetchVectorStores = async () => {
      try {
        const response = await axios.get('http://localhost:3330/api/vectorStore');
        setVectorStores(response.data);
      } catch (error) {
        console.error('Error fetching vector stores:', error);
      }
    };
    
    fetchVectorStores();
  }, []); // Empty dependency array ensures this only runs once

  useEffect(() => {
    
    const eventSourceSimSiddhi = new EventSource('http://localhost:3330/api/simSiddhiChat');
    const eventSourceDoctorBuddha = new EventSource('http://localhost:3330/api/doctorBuddhaChat');
    const eventSourceWOTSerWell = new EventSource('http://localhost:3330/api/wotserWellChat');

    eventSourceSimSiddhi.onmessage = (event) => {setAccumulatedSimSiddhiMessage((prevMessage) => prevMessage + event.data);};
    eventSourceDoctorBuddha.onmessage = (event) => {setAccumulatedDoctorBuddhaMessage((prevMessage) => prevMessage + event.data);};
    eventSourceWOTSerWell.onmessage = (event) => {setAccumulatedWotserWellMessage((prevMessage) => prevMessage + event.data);};

    eventSourceSimSiddhi.addEventListener('done', () => {
      setSimSiddhiChatMessages(prevMessages => [
        ...prevMessages,
        { text: accumulatedSimSiddhiMessage.trim(), isUser: false }
      ]);
      setAccumulatedSimSiddhiMessage('');
    });
    eventSourceDoctorBuddha.addEventListener('done', () => {
      setDoctorBuddhaChatMessages(prevMessages => [
        ...prevMessages,
        { text: accumulatedDoctorBuddhaMessage.trim(), isUser: false }
      ]);
      setAccumulatedDoctorBuddhaMessage('');
    });
    eventSourceWOTSerWell.addEventListener('done', () => {
      setWotserWellChatMessages(prevMessages => [
        ...prevMessages,
        { text: accumulatedWotserWellMessage.trim(), isUser: false }
      ]);
      setAccumulatedWotserWellMessage('');
    });

    eventSourceSimSiddhi.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSourceSimSiddhi.close();
    };
    eventSourceDoctorBuddha.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSourceDoctorBuddha.close();
    };
    eventSourceWOTSerWell.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSourceWOTSerWell.close();
    };

    return () => {
      eventSourceSimSiddhi.close();
      eventSourceDoctorBuddha.close();
      eventSourceWOTSerWell.close();
    };
  }, [
    accumulatedSimSiddhiMessage,
    accumulatedDoctorBuddhaMessage,
    accumulatedWotserWellMessage
  ]);




  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3330/api/transcribe', { url: youtubeLink, vectorStoreId });
      console.log('Transcription complete! The file has been saved.');
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsLoading(false);
    }
  };




  const handleSimSiddhiChatSubmit = async () => {
    if (!chatSimSiddhiInput.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3330/api/simSiddhiChat', { message: chatSimSiddhiInput });

      if (response.status === 200) {
        setSimSiddhiChatMessages(prevMessages => [
          ...prevMessages,
          { text: chatSimSiddhiInput, isUser: true },
          { text: response.data, isUser: false }
        ]);
      }
    } catch (error) {
      console.error('Error sending message to chat:', error);
    } finally {
      setSimSiddhiChatInput('');
      setIsLoading(false);
    }
  };


  const handleDoctorBuddhaChatSubmit = async () => {
    if (!chatDoctorBuddhaInput.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3330/api/doctorBuddhaChat', { message: chatDoctorBuddhaInput });

      if (response.status === 200) {
        setDoctorBuddhaChatMessages(prevMessages => [
          ...prevMessages,
          { text: chatDoctorBuddhaInput, isUser: true },
          { text: response.data, isUser: false }
        ]);
      }
    } catch (error) {
      console.error('Error sending message to chat:', error);
    } finally {
      setDoctorBuddhaChatInput('');
      setIsLoading(false);
    }
  };

  const handleWotserWellChatSubmit = async () => {
    if (!chatWotserWellInput.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3330/api/wotserWellChat', { 
        
        message: chatWotserWellInput
        

      });

      if (response.status === 200) {
        setWotserWellChatMessages(prevMessages => [
          ...prevMessages,
          { text: chatWotserWellInput, isUser: true },
          { text: response.data, isUser: false }
        ]);
      }
    } catch (error) {
      console.error('Error sending message to chat:', error);
    } finally {
      setWotserWellChatInput('');
      setIsLoading(false);
    }
  };

  const isCorrectWallet = walletAddress && typeof walletAddress === 'string' && walletAddress.toLowerCase() === correctWalletAddress.toLowerCase();

  return (
    <div id="bottomToolbar">
      <div id="bottomArrow" className="arrow" onClick={() => window.location.href = 'bottomPage.html'}>
        <span>&darr;</span>
      </div>
      {isCorrectWallet && (
        <div className="youtube-section">
          {!showInput && (
            <img
              src="/assets/Youtube_Logo.png"
              alt="YouTube"
              className="youtube-logo"
              onClick={() => setShowInput(true)}
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
              <select
                value={vectorStoreId}
                onChange={(e) => setVectorStoreId(e.target.value)}
                className="vector-store-select"
              >
                <option value="">Create New Vector Store</option>
                {vectorStores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <button onClick={handleTranscribe} disabled={isLoading || !youtubeLink} className="transcribe-button">
                {isLoading ? 'Transcribing...' : 'Transcribe'}
              </button>
              {isLoading && <div className="loading-spinner">Loading...</div>}
            </div>
          )}
        </div>
      )}
      <div className="chat-icons">
      <img
          src="https://bafybeia7dr3aeh53mmqxnpwfga2zflp2u6msvwih4iiziwrfxct5ti4of4.ipfs.w3s.link/SimSiddhiChat.png" 
          alt="Chat Icon"
          className="chat-icon"
          onClick={() => setShowSimSiddhiChat(!showSimSiddhiChat)}
          style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
        />
        <img
          src="https://bafybeid6y5ibkrn2y7ddkolpzo53i7rbdbjxscmivbrmq4vtrapnl6l5wa.ipfs.w3s.link/DoctorBuddha.png" 
          alt="DoctorBuddha Icon"
          className="doctor-buddha-icon"
          onClick={() => {setShowDoctorBuddhaChat(!showDoctorBuddhaChat);}}
          style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
        />
        <img
          src="https://bafybeidpjh43gomls6rkxym4cbetd6cufc7y3uhplgo5ur7ufjeg5fdghi.ipfs.w3s.link/WOTSERWell.jpeg"
          alt="WotserWell Icon"
          className="wotser-well-icon"
          onClick={() => {setShowWotserWellChat(!showWotserWellChat);}}
          // display inline
          style={{ cursor: 'pointer', width: '50px', height: '50px', borderRadius: '5px' }}
        />
      </div>
      {showSimSiddhiChat && (
        <div className="chat-window">
          <div className="messages">
            {chatSimSiddhiMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={chatSimSiddhiInput}
            onChange={(e) => setSimSiddhiChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSimSiddhiChatSubmit();
            }}
            placeholder="Ask Sim Siddhi God ⚸ 🌱 🐄"
            className="chat-input"
          />
          <button onClick={handleSimSiddhiChatSubmit} className="send-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
      {showDoctorBuddhaChat && (
        <div className="chat-window">
          <div className="messages">
            {chatDoctorBuddhaMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={chatDoctorBuddhaInput}
            onChange={(e) => setDoctorBuddhaChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDoctorBuddhaChatSubmit();
            }}
            placeholder="⚕️⚸ Ask Doctor Buddha 🧞‍♂️⚕️"
            className="chat-input"
          />
          <button onClick={handleDoctorBuddhaChatSubmit} className="send-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}

      { showWotserWellChat && (
        <div className="chat-window">
          <div className="messages">
            {chatWotserWellMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={chatWotserWellInput}
            onChange={(e) => setWotserWellChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleWotserWellChatSubmit();
            }}
            placeholder=" 🧞‍♂️ The WOTSer Well ⚸ ⛲️ 🐄"
            className="chat-input"
          />
          <button onClick={handleWotserWellChatSubmit} className="send-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomToolbar;