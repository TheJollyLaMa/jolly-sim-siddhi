const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const speech = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');

const router = express.Router();
const openai = new OpenAI(
  process.env.OPENAI_API_KEY,
  process.env.OPENAI_PROJECT_ID
);

const assistantId = process.env.OPENAI_WOTSerWell_ASSISTANT_ID;
const threadId = process.env.OPENAI_WOTSerWell_THREAD_ID;

const storage = new Storage();
const client = new speech.SpeechClient();

const bucketName = 'jolly_transcriptions'; // Replace with your bucket name

// Function to upload file to Google Cloud Storage
async function uploadFileToGCS(filePath) {
  const destination = path.basename(filePath);
  await storage.bucket(bucketName).upload(filePath, {
    destination: destination,
  });
  return `gs://${bucketName}/${destination}`;
}

// Function to transcribe audio using Google Cloud Speech-to-Text
async function transcribeAudioChunkGCS(gcsUri) {
  const audio = {
    uri: gcsUri,
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  return response.results.map(result => result.alternatives[0].transcript).join('\n');
}

// Function to split audio into chunks
function splitAudio(inputPath, outputDir, chunkLength) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(`${outputDir}/chunk-%03d.wav`)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .outputOptions([
        `-segment_time ${chunkLength}`,
        '-f segment',
        '-reset_timestamps 1'
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

// Route to handle transcription and add to an existing vector store
router.post('/wotserWellChat/transcribeAndStore', async (req, res) => {
  const { url, vectorStoreId } = req.body;
  const audioPath = path.join(__dirname, 'audio.wav');
  const chunksDir = path.join(__dirname, 'chunks');
  const transcriptionFilePath = path.join(__dirname, 'transcription.txt');

  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir);
  }

  try {
    // Download audio from YouTube
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'wav',
      output: audioPath,
      ffmpegLocation: '/opt/homebrew/bin/ffmpeg'  // Ensure this points to your ffmpeg location
    });

    console.log('Audio downloaded:', audioPath);

    // Split the audio into 1-minute chunks
    await splitAudio(audioPath, chunksDir, 60);
    console.log('Audio split into chunks');

    // Transcribe each chunk
    const chunkFiles = fs.readdirSync(chunksDir).filter(file => file.endsWith('.wav'));
    let transcription = '';

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(chunksDir, chunkFile);
      const gcsUri = await uploadFileToGCS(chunkPath);
      const chunkTranscription = await transcribeAudioChunkGCS(gcsUri);
      transcription += chunkTranscription + '\n';
    }

    // Save the transcription to a file
    fs.writeFileSync(transcriptionFilePath, transcription);
    console.log('Transcription saved to', transcriptionFilePath);

    // Add the transcription to the existing vector store
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, [fs.createReadStream(transcriptionFilePath)]);
    
    res.json({ message: 'Transcription completed and added to existing vector store', vectorStoreId });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request');
  } finally {
    // Clean up the audio files
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    if (fs.existsSync(chunksDir)) {
      fs.readdirSync(chunksDir).forEach(file => fs.unlinkSync(path.join(chunksDir, file)));
      fs.rmdirSync(chunksDir);
    }
  }
});

router.post('/wotserWellChat', async (req, res) => {
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

router.get('/wotserWellChat', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Sends the headers and starts the SSE

  // Set up event stream
  res.write('data: Connected\n\n');

  // Send a message every 5 seconds
  const interval = setInterval(() => {
    res.write('data: Message from the server\n\n');
  }, 5000);

  // Clean up on client disconnect
  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });

});

module.exports = router;