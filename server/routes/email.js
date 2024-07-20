const express = require('express');
const { Blob } = require('buffer');
require('dotenv').config();
const router = express.Router();

const parseProof = require('../helpers/parseProof').parseProof;

router.post('/submit-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    const { create } = await import('@web3-storage/w3up-client');
    const { Signer: EdSigner } = await import('@ucanto/principal/ed25519');
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

module.exports = router;