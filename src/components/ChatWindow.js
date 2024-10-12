import React, { useState, useEffect } from 'react';
import '../styles/ChatWindows.css';
import axios from 'axios';

const ChatWindow = ({ apiEndpoint, title, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [pendingYouTubeLink, setPendingYouTubeLink] = useState(null);
  const [vectorStores, setVectorStores] = useState([]);
  const [eventSource, setEventSource] = useState(null);
  const [conversationStep, setConversationStep] = useState(null); // Track the current conversation step

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
    
    // Update state to include the user's message
    setMessages(updatedMessages);
    setInputValue(''); // Clear input field immediately after adding message to state

    // Handle YouTube link detection
    if (detectYouTubeLink(message)) {
      const youtubeUrl = message.match(youtubeRegex)[0];
      setPendingYouTubeLink(youtubeUrl);

      updatedMessages.push({ text: `It looks like you've given me a YouTube link: ${youtubeUrl}. Would you like me to transcribe it?`, isUser: false });
      setMessages(updatedMessages);
      setConversationStep('confirmTranscription'); // Move to the next step
      return;
    }

    // Handle different conversation steps
    if (conversationStep === 'confirmTranscription') {
      if (message.toLowerCase() === 'yes') {
        try {
          const response = await axios.get(`http://localhost:3330/api/vectorStore`);
          setVectorStores(response.data);

          updatedMessages.push({ text: 'Please choose from the following options:\n  1. Download the transcription\n  2. Add to an existing vector store\n  3. Create a new vector store', isUser: false });
          setMessages(updatedMessages);
          setConversationStep('chooseOption'); // Move to the next step
        } catch (error) {
          console.error('Error fetching vector stores:', error);
        }
      } else {
        updatedMessages.push({ text: 'Okay, I will not transcribe the video.', isUser: false });
        setMessages(updatedMessages);
        setPendingYouTubeLink(null);
        setConversationStep(null); // Reset the step
      }
    } else if (conversationStep === 'chooseOption') {
      if (['1', '2', '3'].includes(message)) {
        if (message === '1') {
          // Handle transcription download
          try {
            await axios.post(`http://localhost:3330/api/transcribeAndStore`, { url: pendingYouTubeLink });
            updatedMessages.push({ text: 'Your transcription is ready for download.', isUser: false });
            setMessages(updatedMessages);
            setPendingYouTubeLink(null);
            setConversationStep(null); // Reset the step
          } catch (error) {
            console.error('Error downloading transcription:', error);
          }
        } else if (message === '2') {
          // Show existing vector stores to the user
          updatedMessages.push({ text: 'Here are your existing vector stores:', isUser: false });
          
          vectorStores.forEach((store, index) => {
            updatedMessages.push({ text: `${index + 1}. ${store.name}`, isUser: false });
          });
          
          setMessages(updatedMessages);
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Please enter the number of the vector store you would like to add the transcription to:', isUser: false }
          ]);
          setConversationStep('selectVectorStore'); // Move to the next step
        } else if (message === '3') {
          // Create a new vector store and add the transcription
          try {
            const newVectorStoreResponse = await axios.post(`http://localhost:3330/api/vectorStore/create`, { name: 'New Vector Store' });
            await axios.post(`http://localhost:3330/api/transcribeAndStore`, { url: pendingYouTubeLink, vectorStoreId: newVectorStoreResponse.data.id });
            updatedMessages.push({ text: 'Transcription added to the new vector store.', isUser: false });
            setMessages(updatedMessages);
            setPendingYouTubeLink(null);
            setConversationStep(null); // Reset the step
          } catch (error) {
            console.error('Error creating new vector store:', error);
          }
        }
      } else {
        updatedMessages.push({ text: 'Invalid selection. Please enter a valid option (1, 2, or 3).', isUser: false });
        setMessages(updatedMessages);
      }
    } else if (conversationStep === 'selectVectorStore') {
      const vectorStoreIndex = parseInt(message) - 1;

      if (isNaN(vectorStoreIndex) || vectorStoreIndex < 0 || vectorStoreIndex >= vectorStores.length) {
        // Handle invalid input (e.g., not a number, or a number out of range)
        updatedMessages.push({ text: 'Invalid selection. Please enter a number corresponding to one of the listed vector stores.', isUser: false });
        setMessages(updatedMessages);
      } else {
        // Valid input, proceed with transcription
        const vectorStoreId = vectorStores[vectorStoreIndex].id;
        updatedMessages.push({ text: 'Adding transcription to the selected vector store. Please be patient...', isUser: false });
        setMessages(updatedMessages);

        try {
          await axios.post(`http://localhost:3330/api/transcribeAndStore`, {
            url: pendingYouTubeLink,
            vectorStoreId: vectorStoreId
          });

          updatedMessages.push({ text: 'Transcription added to the existing vector store.', isUser: false });
          setMessages(updatedMessages);
          setPendingYouTubeLink(null);
          setConversationStep(null); // Reset the step
        } catch (error) {
          console.error('Error adding transcription to vector store:', error);
          updatedMessages.push({ text: 'Error adding transcription to vector store.', isUser: false });
          setMessages(updatedMessages);
        }
      }
    } else {
      // Handle regular messages and send to backend
      try {
        console.log('Sending regular message:', message);

        // Close any existing EventSource before opening a new one
        if (eventSource) {
          eventSource.close();
        }

        // Stream the assistant's response using EventSource
        const newEventSource = new EventSource(`http://localhost:3330/api/${apiEndpoint}?message=${encodeURIComponent(message)}`);

        let accumulatedText = '';  // For accumulating streamed text

        newEventSource.onmessage = (event) => {
          console.log('Received SSE message:', event.data);

          if (event.data.trim()) {
            accumulatedText += event.data;  // Accumulate the streamed text
            setMessages((prevMessages) => {
              // Update the last bot message if already present
              if (prevMessages.length > 0 && !prevMessages[prevMessages.length - 1].isUser) {
                return [...prevMessages.slice(0, -1), { text: accumulatedText, isUser: false }];
              } else {
                // Otherwise, add a new message
                return [...prevMessages, { text: accumulatedText, isUser: false }];
              }
            });
          }
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
  };

  return (
    <div className="chat-window">
      <h2>{title}</h2> {/* Add a title to the chat window */}
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
        placeholder={placeholder}
      />
      <button onClick={handleMessageSend}>Send</button>
    </div>
  );
};

export default ChatWindow;