const OpenAI = require('openai');
const express = require('express');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Log the incoming message
  console.log('Message:', message);

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Invalid message content' });
  }

  try {
    // Create a new thread using the assistant ID
    const thread = await openai.beta.threads.create({
      messages: [{ role: 'user', content: message }],
      assistant_id: 'asst_xImFud4ZmnpqGZigTAYsCdnY',
    });

    // Log the thread ID
    console.log(`Thread created with ID: ${thread.id}`);

    // Stream a new run with the created thread
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: 'asst_xImFud4ZmnpqGZigTAYsCdnY',
    })
      .on('textCreated', (text) => process.stdout.write('\nassistant > '))
      .on('textDelta', (textDelta, snapshot) => {
        process.stdout.write(textDelta.value);
        res.write(textDelta.value);
      })
      .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
      .on('toolCallDelta', (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === 'code_interpreter') {
          if (toolCallDelta.code_interpreter.input) {
            process.stdout.write(toolCallDelta.code_interpreter.input);
          }
          if (toolCallDelta.code_interpreter.outputs) {
            process.stdout.write("\noutput >\n");
            toolCallDelta.code_interpreter.outputs.forEach(output => {
              if (output.type === "logs") {
                process.stdout.write(`\n${output.logs}\n`);
              }
            });
          }
        }
      });

    run.on('done', () => {
      res.end(); // End the response when streaming is done
      console.log('Run completed');
    });

    run.on('error', (error) => {
      console.error('Error during run:', error);
      res.status(500).json({ error: 'Error during assistant run' });
    });

  } catch (error) {
    console.error('Error creating thread or running assistant:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to create thread or run assistant' });
  }
});

module.exports = router;