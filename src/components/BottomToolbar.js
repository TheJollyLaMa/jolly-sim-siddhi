import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Toolbar.css';

const BottomToolbar = ({ walletAddress }) => {
  const [showInput, setShowInput] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [accumulatedMessage, setAccumulatedMessage] = useState(''); // Accumulator for incoming SSE data

  const correctWalletAddress = '0x807061df657a7697c04045da7d16d941861caabc';

  useEffect(() => {
    // Initialize the EventSource for server-sent events
    const eventSource = new EventSource('http://localhost:3330/api/chat');

    // log eventSource
    console.log('EventSource:', eventSource); // Diagnostic 

    eventSource.onmessage = (event) => {
      console.log('Event received:', event.data); // Diagnostic
      setAccumulatedMessage((prevMessage) => prevMessage + event.data);
    };

    eventSource.addEventListener('done', () => {
      // Add the accumulated message to chat messages when the message is complete
      console.log('Final accumulated message:', accumulatedMessage); // Diagnostic
      setChatMessages(prevMessages => [
        ...prevMessages,
        { text: accumulatedMessage.trim(), isUser: false }
      ]);
      setAccumulatedMessage(''); // Clear the accumulator
    });

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error); // Diagnostic
      eventSource.close();
    };

    // Cleanup EventSource on component unmount
    return () => {
      eventSource.close();
      console.log('EventSource closed.'); // Diagnostic
    };
  }, []);

  const handleTranscribe = async () => {
    setIsLoading(true);
    console.log('Transcription started for link:', youtubeLink); // Diagnostic
    try {
      await axios.post('http://localhost:3330/api/transcribe', { url: youtubeLink });
      console.log('Transcription complete! The file has been saved.');
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsLoading(false);
      console.log('Transcription process ended.'); // Diagnostic
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) {
      console.error('Empty prompt. Please enter a valid message.');
      return;
    }

    setIsLoading(true); // Show loading state during the request
    console.log('Sending message:', chatInput); // Diagnostic
    try {
      const response = await axios.post('http://localhost:3330/api/chat', { message: chatInput });

      console.log('Chat response:', response); // Diagnostic

      if (response.status === 200) {
        // Add user message to chat
        setChatMessages(prevMessages => [
          ...prevMessages,
          { text: chatInput, isUser: true }
        ]);
        // Add bot message to chat
        setChatMessages(prevMessages => [
          ...prevMessages,
          { text: response.data, isUser: false }
        ]);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error sending message to chat:', error);
    } finally {
      setChatInput(''); // Clear input field after sending message
      setIsLoading(false); // Hide loading state after the request completes
      console.log('Chat input cleared and loading state reset.'); // Diagnostic
    }
  };

  const isCorrectWallet = walletAddress && typeof walletAddress === 'string' && walletAddress.toLowerCase() === correctWalletAddress.toLowerCase();
  console.log('Is correct wallet:', isCorrectWallet);

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
        onClick={() => {
          console.log('Chat icon clicked, toggling chat window.'); // Diagnostic
          setShowChat(!showChat);
        }}
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
            onChange={(e) => {
              setChatInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleChatSubmit();
              }
            }}
            placeholder="Ask Sim Siddhi God..."
            className="chat-input"
          />
          <button onClick={handleChatSubmit} className="send-button">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomToolbar;