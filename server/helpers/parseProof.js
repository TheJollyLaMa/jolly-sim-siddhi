async function parseProof(data) {
    const { CarReader } = await import('@ipld/car');
    const blocks = [];
    const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
    for await (const block of reader.blocks()) {
      blocks.push(block);
    }
    const { importDAG } = await import('@ucanto/core/delegation');
    const proof = await importDAG(blocks);
    return proof;
  }
  
  module.exports = { parseProof };