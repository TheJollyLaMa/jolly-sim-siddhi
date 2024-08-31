const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT_ID,
});

router.post('/vectorStore', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { message } = req.body;
    console.log('Message received to Vector Store API:', message);
    // Process the message here as needed
    res.end(); // End the stream properly
});

router.get('/vectorStore', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const response = await openai.beta.vectorStores.list();
        if (response && response.data) {
            // console.log('List of vector stores:', response.data);
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

module.exports = router;