const fs = require('fs');
const path = require('path');
const { create } = require('@web3-storage/w3up-client');
const { Signer: EdSigner } = require('@ucanto/principal/ed25519');

// Path to your w3cli.json
const w3cliPath = path.join(process.env.HOME, '.config', 'w3up', 'w3cli.json');

// Read the w3cli.json file
const w3cliConfig = JSON.parse(fs.readFileSync(w3cliPath, 'utf8'));

async function setupClient() {
  try {
    // Use the private key from w3cli.json
    const privateKey = w3cliConfig.principal.keys[w3cliConfig.principal.id].$bytes;
    const principal = EdSigner.parse(privateKey);

    // Create a memory store for the client
    const store = new (require('@web3-storage/w3up-client/stores/memory')).StoreMemory();
    const client = await create({ principal, store });

    // Add proof (from your w3cli.json file)
    const proof = await parseProof(w3cliConfig.spaces.$map[0][1].proof);

    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    console.log('Setup complete. Client is using DID:', client.agent().did());

    // Now you can upload files just like in the CLI
  } catch (error) {
    console.error('Error during client setup:', error);
  }
}

// Helper function to parse proof (this logic may vary slightly)
async function parseProof(proofString) {
  const { CarReader } = await import('@ipld/car');
  const reader = await CarReader.fromBytes(Buffer.from(proofString, 'base64'));
  const blocks = [];
  for await (const block of reader.blocks()) {
    blocks.push(block);
  }
  const { importDAG } = await import('@ucanto/core/delegation');
  return importDAG(blocks);
}

// Run the setup
setupClient();