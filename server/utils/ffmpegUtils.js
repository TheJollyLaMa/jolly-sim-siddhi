const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

function splitAudio(inputPath, outputDir, chunkLength) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(`${outputDir}/chunk-%03d.wav`)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .outputOptions([`-segment_time ${chunkLength}`, '-f segment', '-reset_timestamps 1'])
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = { splitAudio };