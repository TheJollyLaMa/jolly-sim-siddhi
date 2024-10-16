const bs58 = require('bs58').default;
console.log('Base58', bs58);

// Helper function to decode base64 and encode to base58
function encodeBase64ToBase58(base64String) {
  const decodedBytes = Buffer.from(base64String, 'base64'); // Decode base64
  console.log('Decoded Bytes:', decodedBytes);
  const encodedBase58 = bs58.encode(decodedBytes); // Encode to base58
  return encodedBase58;
}

// Replace with your base64-encoded private key
const base64PrivateKey = "";

// Convert to base58 and print it out
const base58PrivateKey = encodeBase64ToBase58(base64PrivateKey);
console.log('Base58 Encoded Private Key:', base58PrivateKey);