const express = require('express');
const { parseProof } = require('../helpers/parseProof');
require('dotenv').config();
const router = express.Router();

router.post('/submit-land-survey', async (req, res) => {
  const { surveyData } = req.body;

  if (!surveyData) {
    return res.status(400).send({ error: 'Survey data is required' });
  }

  try {
    const { create, File } = await import('@web3-storage/w3up-client');
    const { Signer: EdSigner } = await import('@ucanto/principal/ed25519');
    const { StoreMemory } = await import('@web3-storage/w3up-client/stores/memory');

    const principal = EdSigner.parse(process.env.W3UP_KEY_PRIVATE);
    const store = new StoreMemory();
    const client = await create({ principal, store });

    const proof = await parseProof(process.env.PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    const surveyBlob = new Blob([JSON.stringify(surveyData)], { type: 'application/json' });
    const cid = await client.uploadFile(surveyBlob);

    console.log('Uploaded survey CID:', cid);
    res.status(200).send({ cid });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'Error uploading file' });
  }
});

module.exports = router;