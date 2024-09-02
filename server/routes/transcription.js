const express = require('express');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const { transcribeAudioChunkGCS, uploadFileToGCS } = require('../utils/gcsUtils');
const { splitAudio } = require('../utils/ffmpegUtils');
const { OpenAI } = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/transcribeAndStore', async (req, res) => {
  const { url, vectorStoreId } = req.body;
  // log the incoming variables with a message
  console.log('Transcribing and storing:', url, vectorStoreId);

  const audioPath = path.join(__dirname, '..', 'audio.wav');
  const chunksDir = path.join(__dirname, '..', 'chunks');


  // const transcriptionFilePath = path.join(__dirname, '..', 'transcription.txt');

  if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir);

  try {

    // Extract title from YouTube video
    const { title } = await youtubedl(url, {
      dumpSingleJson: true,
    });

    // Sanitize title for file name
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    const transcriptionFilePath = path.join(__dirname, '..', `${sanitizedTitle}.txt`);
        
    // Download and process audio from YouTube
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'wav',
      output: audioPath,
      ffmpegLocation: '/opt/homebrew/bin/ffmpeg',
    });

    await splitAudio(audioPath, chunksDir, 60);

    const chunkFiles = fs.readdirSync(chunksDir).filter(file => file.endsWith('.wav'));
    let transcription = '';

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(chunksDir, chunkFile);
      const gcsUri = await uploadFileToGCS(chunkPath);
      const chunkTranscription = await transcribeAudioChunkGCS(gcsUri);
      transcription += chunkTranscription + '\n';
    }

    fs.writeFileSync(transcriptionFilePath, transcription);
    // try catch for sending to vectorestore
    let openai_response;
    
    // Ensure the file exists before trying to upload it
    if (!fs.existsSync(transcriptionFilePath)) {
      throw new Error('Transcription file not found');
    }
    console.log('Transcription complete:', transcriptionFilePath);
    // console.log(fs.createReadStream(transcriptionFilePath));
    try {
      if (vectorStoreId) {
        // create new vector store file
        const file = await openai.files.create({
          file: fs.createReadStream(transcriptionFilePath),
          purpose: "assistants",
        });
      
        console.log(file);
        const myVectorStoreFile = await openai.beta.vectorStores.files.create(
          vectorStoreId,
          { file_id: file.id }
          );
          console.log(myVectorStoreFile);
        

        console.log('Transcription uploaded to vector store:', myVectorStoreFile);
        res.json({ message: 'Transcription completed and added to vector store', myVectorStoreFile });
      } else {
        // Send a message and the transcription back as a text file
        res.json({ message: 'Transcription completed', transcription: transcriptionFilePath });
      }
    } catch (error) {
      console.error('Error during transcription or uploading:', error);
      res.status(500).json({ message: 'An error occurred during transcription or uploading.', error: error.message });
    }


  } catch (error) {
    console.error('Error processing transcription:', error);
    res.status(500).json({ error: 'Failed to process transcription' });
  } finally {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(chunksDir)) {
      fs.readdirSync(chunksDir).forEach(file => fs.unlinkSync(path.join(chunksDir, file)));
      fs.rmdirSync(chunksDir);
    }
  }
});


module.exports = router;