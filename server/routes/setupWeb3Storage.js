const express = require('express');
const { parseProof } = require('../helpers/parseProof');
require('dotenv').config();
const router = express.Router();

router.post('/setup-web3storage', async (req, res) => {
  const { walletAddress, email } = req.body;

  if (!walletAddress || !email) {
    console.error('Missing wallet address or email', req.body);
    return res.status(400).send({ error: 'Wallet address and email are required' });
  }

  try {
    const { Client } = await import('@web3-storage/w3up-client');
    const { generate } = await import('@ucanto/principal/ed25519');
    const { StoreMemory } = await import('@web3-storage/access/stores/store-memory');
    const { Agent } = await import('@web3-storage/access');

    console.log('Imports successful');

    // Generate a key pair
    const principal = await generate();
    console.log('Key pair generated:', principal);

    const did = principal.did();
    if (!did) {
      throw new Error('DID is not defined on principal');
    }
    console.log('DID:', did);

    // Create an agent with the principal
    const agentData = { principal };
    const serviceConf = { /* your service configuration here */ };
    const agent = new Agent(agentData, { serviceConf });
    console.log('Agent created:', agent);

    // Ensure StoreMemory is correctly instantiated
    const store = new StoreMemory();
    const client = new Client(agent, { store });
    console.log('Client created:', client);

    await client.capability.access.authorize(email);
    await client.capability.access.claim();
    console.log('Agent authorized');

    const space = await client.createSpace('user-space');
    await client.setCurrentSpace(space.did());
    await client.registerSpace(email, { provider: 'did:web:web3.storage' });
    console.log('Space created and registered:', space);

    const fs = require('fs');
    fs.appendFileSync('.env', `\n${walletAddress}_PRIVATE_KEY=${principal.secret.toString('base64')}`);
    fs.appendFileSync('.env', `\n${walletAddress}_PROOF=${encodedUcan}`);

    res.status(200).send({ storageDid: space.did() });
  } catch (error) {
    console.error('Error setting up web3.storage:', error);
    res.status(500).send({ error: 'Error setting up web3.storage' });
  }
});

module.exports = router;