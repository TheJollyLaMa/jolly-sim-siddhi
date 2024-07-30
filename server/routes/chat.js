const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: "Invalid message content" });
  }

  try {

// We use the stream SDK helper to create a run with
// streaming. The SDK provides helpful event listeners to handle 
// the streamed response.
 
// const run = openai.beta.threads.runs.stream(thread.id, {
//     assistant_id: "asst_xImFud4ZmnpqGZigTAYsCdnY"
//   })
//     .on('textCreated', (text) => process.stdout.write('\nassistant > '))
//     .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
//     .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
//     .on('toolCallDelta', (toolCallDelta, snapshot) => {
//       if (toolCallDelta.type === 'code_interpreter') {
//         if (toolCallDelta.code_interpreter.input) {
//           process.stdout.write(toolCallDelta.code_interpreter.input);
//         }
//         if (toolCallDelta.code_interpreter.outputs) {
//           process.stdout.write("\noutput >\n");
//           toolCallDelta.code_interpreter.outputs.forEach(output => {
//             if (output.type === "logs") {
//               process.stdout.write(`\n${output.logs}\n`);
//             }
//           });
//         }
//       }
//     });

    const response = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-1106:sim-siddhi:simsiddhi:9qmGIKki",
      messages: [
        { role: "user", content: message }
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});

module.exports = router;