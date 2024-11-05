const express = require('express');
const Web3 = require('web3').Web3;
const router = express.Router();
require('dotenv').config();


// Initialize web3 for Ethereum network
const web3Ethereum = new Web3(process.env.ETHEREUM_RPC_URL);
// Initialize web3 for Polygon network
const web3Polygon = new Web3(process.env.POLYGON_RPC_URL);
// Initialize web3 for MintMe network (assuming you have the RPC URL)
const web3MintMe = new Web3(process.env.MINTME_RPC_URL);

// SmartHomeTest token contract details
const SHT_TOKEN_CONTRACT_ADDRESS = process.env.SHT_TOKEN_CONTRACT_ADDRESS;
const SHT_TOKEN_ABI = require('../abis/SHT.json');
// console.log('SHT_TOKEN_ABI:', SHT_TOKEN_ABI);

// Create a contract instance for SHT
const shtContract = new web3Polygon.eth.Contract(SHT_TOKEN_ABI, SHT_TOKEN_CONTRACT_ADDRESS);

// MintMe token contract details (use your MintMe token ABI and contract address)
const MINTME_TOKEN_CONTRACT_ADDRESS = process.env.MINTME_TOKEN_CONTRACT_ADDRESS;
const MINTME_TOKEN_ABI = require('../abis/MintMe.json'); // Add the ABI of your MintMe contract here

// Create a contract instance for MintMe
const mintMeContract = new web3MintMe.eth.Contract(MINTME_TOKEN_ABI, MINTME_TOKEN_CONTRACT_ADDRESS);

// Create a contract instance for DSH
const DSH_TOKEN_CONTRACT_ADDRESS = process.env.DECENT_SMARTHOME_ON_MINTME;
const DSH_TOKEN_ABI = require('../abis/MintMe.json');
const dshContract = new web3MintMe.eth.Contract(DSH_TOKEN_ABI, DSH_TOKEN_CONTRACT_ADDRESS);



// Import the LP token contract ABI and create a contract instance
const LP_TOKEN_ABI = require('../abis/QuickV3_Algebra_LP.json');
const LP_TOKEN_CONTRACT_ADDRESS = process.env.LP_TOKEN_CONTRACT_ADDRESS;  // Set this in your .env file
// Instantiate the contract
const lpTokenContract = new web3Polygon.eth.Contract(LP_TOKEN_ABI, LP_TOKEN_CONTRACT_ADDRESS);



// Route to fetch ETH balance for a given wallet address
router.get('/get-eth-balance', async (req, res) => {
  const { walletAddress } = req.query;

  try {
    const balance = await web3Ethereum.eth.getBalance(walletAddress);
    const formattedBalance = web3Ethereum.utils.fromWei(balance, 'ether'); // Assuming balance is in Wei

    res.json({ balance: formattedBalance });
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    res.status(500).json({ error: 'Failed to fetch ETH balance' });
  }
});

// Route to fetch POL balance for a given wallet address
router.get('/get-pol-balance', async (req, res) => {
  const { walletAddress } = req.query;

  try {
    const balance = await web3Polygon.eth.getBalance(walletAddress);
    const formattedBalance = web3Polygon.utils.fromWei(balance, 'ether'); // Assuming balance is in Wei

    res.json({ balance: formattedBalance });
  } catch (error) {
    console.error('Error fetching POL balance:', error);
    res.status(500).json({ error: 'Failed to fetch POL balance' });
  }
});

// Route to fetch SHT token balance for a given wallet address
router.get('/get-sht-balance', async (req, res) => {
  const { walletAddress } = req.query;

  try {
    // Call the balanceOf function from the contract
    const balance = await shtContract.methods.balanceOf(walletAddress).call();
    // console.log('balance:', balance);
    const formattedBalance = (Number(balance) / Math.pow(10, 18)).toFixed(4);  // Adjust the decimal places as needed
    // console.log('formattedBalance:', formattedBalance);
    res.json({ balance: formattedBalance });
  
  } catch (error) {
    console.error('Error fetching SHT token balance on Polygon chain:', error);
    res.status(500).json({ error: 'Failed to fetch SHT balance on Polygon chain' });
  }
});

// Route to fetch SHT token balance for a given wallet address
router.get('/get-dsh-balance', async (req, res) => {
  const { walletAddress } = req.query;

  try {
    // Get the balance from the contract
    const rawBalance = await dshContract.methods.balanceOf(walletAddress).call();
    const decimals = await dshContract.methods.decimals().call();

    // Convert both the raw balance and the decimals to BigInt
    const balanceBigInt = BigInt(rawBalance);
    const decimalsBigInt = BigInt(decimals);

    // Adjust the balance based on the decimals
    const divisor = BigInt(10) ** decimalsBigInt;
    const formattedBalance = balanceBigInt / divisor;

    // Convert the BigInt to a string for safe display
    console.log(`Adjusted Balance: ${formattedBalance}`);
    res.json({ balance: formattedBalance.toString() });
  
  } catch (error) {
    console.error('Error fetching DSH token balance on MintMe Chain:', error);
    res.status(500).json({ error: 'Failed to fetch DSH balance on MintMe Chain:' });
  }
});

// Route to fetch MintMe token balance for a given wallet address
router.get('/get-mintme-balance', async (req, res) => {
  const { walletAddress } = req.query;

  try {
    // Call the balanceOf function from the MintMe contract
    const balance = await web3MintMe.eth.getBalance(walletAddress);
    // console.log('balance:', balance);
    // console.log('balance:', typeof balance);
    
    const formattedBalance = web3MintMe.utils.fromWei(balance, 'ether'); // Assuming balance is in Wei
    // console.log('formattedBalance:', formattedBalance);
    res.json({ balance: formattedBalance });

  } catch (error) {
    console.error('Error fetching MintMe token balance:', error);
    res.status(500).json({ error: 'Failed to fetch MintMe balance' });
  }
});

// Helper function to generate position key
const generatePositionKey = (ownerAddress, tickLower, tickUpper) => {
  return web3Polygon.utils.soliditySha3(
    { t: 'address', v: ownerAddress },
    { t: 'int24', v: tickLower },
    { t: 'int24', v: tickUpper }
  );
};

// Route to check LP position ownership and details
router.get('/get-lp-ownership', async (req, res) => {
  const { walletAddress, tickLower, tickUpper, tokenId } = req.query;
  console.log("Token Id:", tokenId);
  try {
    // Generate position key using the wallet address and tick ranges
    const positionKey = generatePositionKey(walletAddress, parseInt(tickLower), parseInt(tickUpper));

    // Retrieve position details
    const position = await lpTokenContract.methods.positions(positionKey).call();

    // Check if the liquidity in the position is greater than 0, indicating ownership
    if (position.liquidity > 0) {
      res.json({ ownsToken: true, liquidity: position.liquidity });
    } else {
      res.json({ ownsToken: false });
    }
  } catch (error) {
    console.error('Error fetching LP ownership:', error);
    res.status(500).json({ error: 'Failed to fetch LP ownership' });
  }

});

module.exports = router;