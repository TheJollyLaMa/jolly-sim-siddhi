const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

// List all vector stores
router.get('/vectorStore', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const response = await openai.beta.vectorStores.list();
        if (response && response.data) {
            console.log('VectorStores Received');
            return res.status(200).json(response.data);
        } else {
            console.error('No data returned from OpenAI');
            return res.status(500).json({ error: 'No data returned from OpenAI' });
        }
    } catch (error) {
        console.error('Error fetching vector stores:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch vector stores' });
        }
    }
});

// create a new vector store
router.post('/vectorStore', async (req, res) => {
    const { name } = req.body;
  
    try {
      const response = await openai.beta.vectorStores.create({
        name,
        description: 'Created via WotserWell Assistant',
      });
  
      if (response && response.data) {
        console.log('New vector store created:', response.data);
        return res.status(201).json({ id: response.data.id, name: response.data.name });
      } else {
        console.error('Failed to create vector store');
        return res.status(500).json({ error: 'Failed to create vector store' });
      }
    } catch (error) {
      console.error('Error creating vector store:', error);
      res.status(500).json({ error: 'Failed to create vector store' });
    }
  });

// Store a transcription in a vector store
router.post('/transcribeAndStore', async (req, res) => {
    const { url, vectorStoreId } = req.body;

    try {
        // Perform transcription (this is a placeholder, replace with actual transcription logic)
        const transcription = await performTranscription(url);

        if (!transcription) {
            return res.status(500).json({ error: 'Failed to transcribe the video' });
        }

        const response = await openai.beta.vectorStores.documents.create({
            vectorStoreId,
            document: {
                content: transcription,
                metadata: { source: url },
            }
        });

        if (response && response.data) {
            console.log('Transcription stored in vector store:', response.data);
            return res.status(200).json(response.data);
        } else {
            console.error('Failed to store transcription in vector store');
            return res.status(500).json({ error: 'Failed to store transcription in vector store' });
        }
    } catch (error) {
        console.error('Error storing transcription in vector store:', error);
        res.status(500).json({ error: 'Failed to store transcription in vector store' });
    }
});

async function performTranscription(url) {
    // This function should contain the logic to transcribe the YouTube video
    // Replace with actual implementation
    return 'Sample transcription for ' + url;
}

module.exports = router;