import React, { useState, useEffect } from 'react';
import axios from 'axios';

const YoutubeTranscriber = () => {
  const [showInput, setShowInput] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vectorStoreId, setVectorStoreId] = useState('');
  const [vectorStores, setVectorStores] = useState([]);

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
  }, []);

  const handleTranscribe = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3330/api/transcribeAndStore', { url: youtubeLink, vectorStoreId });
      console.log('Transcription complete! The file has been saved.');
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default YoutubeTranscriber;