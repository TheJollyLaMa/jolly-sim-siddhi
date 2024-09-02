import React, { useState } from 'react';
import axios from 'axios';

const ChatWindow = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [pendingYouTubeLink, setPendingYouTubeLink] = useState(null);
  const [vectorStores, setVectorStores] = useState([]);

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

  const detectYouTubeLink = (message) => {
    return youtubeRegex.test(message);
  };

  const handleMessageSend = async () => {
    const message = inputValue.trim();

    if (detectYouTubeLink(message)) {
      const youtubeUrl = message.match(youtubeRegex)[0];
      setMessages([...messages, { text: message, isUser: true }]);

      setPendingYouTubeLink(youtubeUrl);

      const response = await axios.post('http://localhost:3330/api/wotserWellChat', {
        message: `It looks like you've given me a YouTube link: ${youtubeUrl}. Would you like me to transcribe it?`,
        options: ['Yes', 'No']
      });

      setMessages([...messages, { text: response.data.message, isUser: false }]);
    } else if (pendingYouTubeLink) {
      if (message.toLowerCase() === 'yes') {
        const response = await axios.get('http://localhost:3330/api/vectorStore');
        setVectorStores(response.data);
        setMessages([...messages, { text: 'Please choose from the following options:\n  1. Download the transcription\n  2. Add to an existing vector store\n  3. Create a new vector store', isUser: false }]);
        if (message === '1') {
          const response = await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink });
          setMessages([...messages, { text: 'Your transcription is ready for download.', isUser: false }]);
          console.log(response.data.transcription);
        
        } else if (message === '2') {
          setMessages([...messages, { text: 'Here are your existing vector stores:', isUser: false }]);
          vectorStores.forEach((store, index) => {
            setMessages([...messages, { text: `${index + 1}. ${store.name}`, isUser: false }]);
          });
          setMessages([...messages, { text: 'Please enter the index of the vector store you would like to add the transcription to:', isUser: false
          }]);
          // post transcribed file and store id to backend route
          const vectorStoreIndex = parseInt(message) - 1;
          if (vectorStoreIndex >= 0 && vectorStoreIndex < vectorStores.length) {
            const vectorStoreId = vectorStores[vectorStoreIndex].id;
            // print a waiting to transcribe message

            await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink, vectorStoreId });
            setMessages([...messages, { text: 'Transcription added to the existing vector store.', isUser: false }]);
          }
        } else if (message === '3') {
          const newVectorStoreResponse = await axios.post('http://localhost:3330/api/vectorStore/create', { name: 'New Vector Store' });
          await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink, vectorStoreId: newVectorStoreResponse.data.id });
          setMessages([...messages, { text: 'Transcription added to the new vector store.', isUser: false }]);
        } 
      
      } else {
        // Handle adding to an existing vector store by index
        const vectorStoreIndex = parseInt(message) - 1;
        if (vectorStoreIndex >= 0 && vectorStoreIndex < vectorStores.length) {
          const vectorStoreId = vectorStores[vectorStoreIndex].id;
          await axios.post('http://localhost:3330/api/transcribeAndStore', { youtubeUrl: pendingYouTubeLink, vectorStoreId });
          setMessages([...messages, { text: 'Transcription added to the existing vector store.', isUser: false }]);
        }
      }
      setPendingYouTubeLink(null);
    } else {
      setMessages([...messages, { text: message, isUser: true }]);
      const response = await axios.post('http://localhost:3330/api/wotserWellChat', { message });
      setMessages([...messages, { text: response.data.message, isUser: false }]);
    }

    setInputValue('');
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleMessageSend()}
        placeholder="Type a message..."
      />
      <button onClick={handleMessageSend}>Send</button>
    </div>
  );
};

export default ChatWindow;