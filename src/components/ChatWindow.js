import React, { useState, useEffect } from 'react';
import '../styles/ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Chat window initialized');
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    console.log('Sending message:', inputMessage);

    try {
      const response = await fetch('http://localhost:3330/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        result += decoder.decode(value, { stream: !done });

        if (result.trim()) {
          setMessages((prevMessages) => [...prevMessages, { text: result, isUser: false }]);
          console.log('Received response:', result);
        }
      }

      setMessages((prevMessages) => [...prevMessages, { text: result, isUser: false }]);
    } catch (error) {
      console.error('Error sending message to chat:', error);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message here..."
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;