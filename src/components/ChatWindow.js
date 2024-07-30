import React, { useState } from 'react';
import '../styles/ChatWindow.css';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:3330/api/chat', { // Update with your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h4>Sim Siddhi God</h4>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;