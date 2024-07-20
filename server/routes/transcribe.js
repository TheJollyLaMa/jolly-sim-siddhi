const express = require('express');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const speech = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');
const client = new speech.SpeechClient();

const router = express.Router();

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

router.post('/transcribe', async (req, res) => {
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

module.exports = router;