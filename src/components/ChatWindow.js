import React, { useState, useEffect } from 'react';
import '../styles/ChatWindows.css';

import axios from 'axios';

const ChatWindow = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [pendingYouTubeLink, setPendingYouTubeLink] = useState(null);
  const [vectorStores, setVectorStores] = useState([]);
  const [eventSource, setEventSource] = useState(null);

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

  const detectYouTubeLink = (message) => {
    return youtubeRegex.test(message);
  };

  useEffect(() => {
    // Close the EventSource when the component unmounts
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleMessageSend = async () => {
    const message = inputValue.trim();
    let updatedMessages = [...messages, { text: message, isUser: true }];
  
    // Detect YouTube link
    if (detectYouTubeLink(message)) {
      const youtubeUrl = message.match(youtubeRegex)[0];
      setPendingYouTubeLink(youtubeUrl);
  
      const response = await axios.post('http://localhost:3330/api/wotserWellChat', {
        message: `It looks like you've given me a YouTube link: ${youtubeUrl}. Would you like me to transcribe it?`,
        options: ['Yes', 'No']
      });
  
      updatedMessages.push({ text: response.data.message, isUser: false });
      setMessages(updatedMessages);
    } else if (pendingYouTubeLink) {
      if (message.toLowerCase() === 'yes') {
        const response = await axios.get('http://localhost:3330/api/vectorStore');
        setVectorStores(response.data);
  
        updatedMessages.push({ text: 'Please choose from the following options:\n  1. Download the transcription\n  2. Add to an existing vector store\n  3. Create a new vector store', isUser: false });
        setMessages(updatedMessages);
  
      } else if (['1', '2', '3'].includes(message)) {
        // Handle numerical choices
        if (message === '1') {
          const response = await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink });
          updatedMessages.push({ text: 'Your transcription is ready for download.', isUser: false });
          console.log('Transcription file:', response.data.transcription);
        } else if (message === '2') {
          updatedMessages.push({ text: 'Here are your existing vector stores:', isUser: false });
          
          vectorStores.forEach((store, index) => {
            updatedMessages.push({ text: `${index + 1}. ${store.name}`, isUser: false });
          });
          
          setMessages(updatedMessages);
        
          // Prompt user to select a vector store by entering its number
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Please enter the number of the vector store you would like to add the transcription to:', isUser: false }
          ]);
        
          // Handle user input for vector store selection
          const vectorStoreIndex = parseInt(message) - 1;
        
          if (isNaN(vectorStoreIndex) || vectorStoreIndex < 0 || vectorStoreIndex >= vectorStores.length) {
            // Handle invalid input (e.g., not a number, or a number out of range)
            setMessages(prevMessages => [
              ...prevMessages,
              { text: 'Invalid selection. Please enter a number corresponding to one of the listed vector stores.', isUser: false }
            ]);
          } else {
            // Valid input, proceed with transcription
            const vectorStoreId = vectorStores[vectorStoreIndex].id;
        
            await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink, vectorStoreId });
            
            setMessages(prevMessages => [
              ...prevMessages,
              { text: 'Transcription added to the existing vector store.', isUser: false }
            ]);
          }
        } else if (message === '3') {
          const newVectorStoreResponse = await axios.post('http://localhost:3330/api/vectorStore/create', { name: 'New Vector Store' });
          await axios.post('http://localhost:3330/api/transcription/transcribeAndStore', { youtubeUrl: pendingYouTubeLink, vectorStoreId: newVectorStoreResponse.data.id });
          updatedMessages.push({ text: 'Transcription added to the new vector store.', isUser: false });
        }
  
      } else {
        updatedMessages.push({ text: 'Okay, I will not transcribe the video.', isUser: false });
        setMessages(updatedMessages);
      }
  
      setPendingYouTubeLink(null);
  
    // Regular message handling
    } else {
      try {
        console.log('Sending regular message:', message);

        // Stream the assistant's response using EventSource
        const newEventSource = new EventSource(`http://localhost:3330/api/wotserWellChat?message=${encodeURIComponent(message)}`);

        newEventSource.onmessage = (event) => {
          const botMessage = event.data;
          console.log('Received bot message:', botMessage);

          // Append the bot's response to the chat
          setMessages((prevMessages) => [...prevMessages, { text: botMessage, isUser: false }]);
        };

        newEventSource.onerror = (error) => {
          console.error('Error in EventSource:', error);
          newEventSource.close();  // Close the stream on error
        };

        setEventSource(newEventSource);  // Store the EventSource instance

      } catch (error) {
        console.error('Error sending message:', error);
        updatedMessages.push({ text: 'Sorry, there was an error processing your message.', isUser: false });
        setMessages(updatedMessages);
      }
    }
  
    setInputValue('');  // Clear the input field after sending
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