const OpenAI = require('openai');
const express = require('express');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

const assistantId = process.env.OPENAI_SimSiddhi_ASSISTANT_ID;
const threadId = process.env.OPENAI_SimSiddhi_THREAD_ID;

router.post('/simSiddhiChat', async (req, res) => {
  
  const { message } = req.body;

  console.log('Message received:', message);

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Invalid message content' });
  }

  try {
    // Log the creation of the message
    console.log('Creating message in the thread...');
    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  
    // Log the start of the assistant run
    console.log('Starting assistant run...');
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      stream: true,
    });
  
    // Set up event stream
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  
    // Log and stream the events back to the client
    for await (const event of run) {
      console.log('event.event:', event.event); // Log all events
      if (event.event === 'thread.message.delta') {
        const textDelta = event.data.delta.content[0].text.value;
        console.log('Text delta:', textDelta); // Diagnostic
        res.write(`${textDelta} `);
      }
  
      if (event.event === 'thread.run.completed') {
        console.log('Run completed.');
        // res.write('[DONE]\n\n');
        res.end();
      }
    }
  
  } catch (error) {
    // Enhanced error logging
    console.error('Error running assistant:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to run assistant' });
  }
});

router.get('/simSiddhiChat', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Sends the headers and starts the SSE

  res.write( 'message: Hello from the simSiddhiChat route!' );

  // Send a message every 5 seconds
  const intervalId = setInterval(() => {
    res.write('data: Still here...\n\n');
  }, 5000);
  
  // Clean up on client disconnect
  res.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });


});

module.exports = router;