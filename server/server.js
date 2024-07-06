const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Blob } = require('buffer');
require('dotenv').config();

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