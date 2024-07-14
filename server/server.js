const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Blob } = require('buffer');
require('dotenv').config();

const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const speech = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');
const client = new speech.SpeechClient();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3330;

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'build')));


app.get('/api', (req, res) => {
  res.send({ message: 'Hello from the server!' });
});

app.post('/submit-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    const { create } = await import('@web3-storage/w3up-client');
    const { Signer: EdSigner } = await import('@ucanto/principal/ed25519');
    const { importDAG } = await import('@ucanto/core/delegation');
    const { StoreMemory } = await import('@web3-storage/w3up-client/stores/memory');

    console.log('Creating principal from W3UP_KEY_PRIVATE...');
    const privateKey = process.env.W3UP_KEY_PRIVATE;
    console.log('Private key:', privateKey);

    const principal = EdSigner.parse(privateKey);
    console.log('Principal created:', principal);

    const store = new StoreMemory();
    const client = await create({ principal, store });

    console.log('Parsing proof...');
    const proof = await parseProof(process.env.PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    const emailBlob = new Blob([email], { type: 'text/plain' });
    const cid = await client.uploadFile(emailBlob);

    console.log('Uploaded email CID:', cid);
    res.status(200).send({ cid });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'Error uploading file' });
  }
});


const storage = new Storage();
const bucketName = 'jolly_transcriptions'; // Replace with your bucket name


async function uploadFileToGCS(filePath) {
    const destination = path.basename(filePath);
    await storage.bucket(bucketName).upload(filePath, {
        destination: destination,
    });
    return `gs://${bucketName}/${destination}`;
}

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

app.post('/transcribe', async (req, res) => {
    const { url } = req.body;
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

        res.json({ message: 'Transcription completed and saved to file', filePath: transcriptionFilePath });
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


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Helper function to parse the proof
async function parseProof(data) {
  const { CarReader } = await import('@ipld/car');
  const blocks = [];
  console.log(data);

  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
  for await (const block of reader.blocks()) {
    blocks.push(block);
  }
  const { importDAG } = await import('@ucanto/core/delegation');
  const proof = await importDAG(blocks);

  console.log('Parsed proof:', proof);
  console.log('Capabilities in proof:', proof.capabilities);

  return proof;
}