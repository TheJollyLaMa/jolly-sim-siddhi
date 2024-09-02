const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');
const path = require('path');

const storage = new Storage();
const client = new speech.SpeechClient();
const bucketName = 'jolly_transcriptions';

async function uploadFileToGCS(filePath) {
  const destination = path.basename(filePath);
  await storage.bucket(bucketName).upload(filePath, { destination });
  return `gs://${bucketName}/${destination}`;
}

async function transcribeAudioChunkGCS(gcsUri) {
  const audio = { uri: gcsUri };
  const config = { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' };
  const request = { audio: audio, config: config };
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  return response.results.map(result => result.alternatives[0].transcript).join('\n');
}

module.exports = { uploadFileToGCS, transcribeAudioChunkGCS };