const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/wotserWellChat', async (req, res) => {
  const { message } = req.body;

  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const youtubeUrl = message.match(youtubeRegex) ? message.match(youtubeRegex)[0] : null;

  if (youtubeUrl) {
    return res.json({
      message: `It looks like you've given me a YouTube link: ${youtubeUrl}. Would you like me to transcribe it?`,
      options: ['Yes', 'No', 'Download']
    });
  }

  if (message.toLowerCase() === 'yes') {
    const vectorStoresResponse = await axios.get('http://localhost:3330/api/vectorStore');
    return res.json({
      message: 'Please select an existing vector store, create a new one, or download the transcription.',
      vectorStores: vectorStoresResponse.data,
      options: ['Create New', 'Download']
    });
  }

  if (message.toLowerCase() === 'download') {
    // Logic for downloading the transcription
    return res.json({ message: 'Your transcription is ready for download.' });
  }

  if (message.toLowerCase() === 'create new') {
    // Logic for creating a new vector store and adding the transcription
    const newVectorStoreResponse = await axios.post('http://localhost:3330/api/vectorStore/create', { name: 'New Vector Store' });
    await axios.post('http://localhost:3330/api/transcribeAndStore', { youtubeUrl, vectorStoreId: newVectorStoreResponse.data.id });
    return res.json({ message: 'Transcription added to the new vector store.' });
  }

  if (message.toLowerCase().startsWith('add to vector store')) {
    const vectorStoreId = message.split(':')[1].trim();
    await axios.post('http://localhost:3330/api/transcribeAndStore', { youtubeUrl, vectorStoreId });
    return res.json({ message: 'Transcription added to the selected vector store.' });
  }

  // Handle regular chat message processing
  res.json({ message: `You said: ${message}` });
});

module.exports = router;