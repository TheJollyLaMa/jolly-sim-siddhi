const express = require('express');
const Web3 = require('web3').Web3;
const router = express.Router();
require('dotenv').config();
const BN = require('bn.js');

// Initialize web3 for Polygon network
const web3Polygon = new Web3(process.env.POLYGON_RPC_URL);

// SmartHomeTest token contract details and init
const SHT_TOKEN_ABI = require('../abis/SHT.json');
const SHT_TOKEN_CONTRACT_ADDRESS = process.env.SHT_TOKEN_CONTRACT_ADDRESS;
// Create a contract instance for SHT
const shtContract = new web3Polygon.eth.Contract(SHT_TOKEN_ABI, SHT_TOKEN_CONTRACT_ADDRESS);

// LP token contract details and init
const LP_TOKEN_ABI = require('../abis/QuickV3_Algebra_LP.json');
const LP_TOKEN_CONTRACT_ADDRESS = process.env.LP_TOKEN_CONTRACT_ADDRESS;  // Set this in your .env file
const lpTokenContract = new web3Polygon.eth.Contract(LP_TOKEN_ABI, LP_TOKEN_CONTRACT_ADDRESS);

// Route to fetch POL balance for a given wallet address
router.get('/get-pol-balance', async (req, res) => {
    const { walletAddress } = req.query;

    try {
        const balance = await web3Polygon.eth.getBalance(walletAddress);
        const formattedBalance = web3Polygon.utils.fromWei(balance, 'ether');

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
        const balance = await shtContract.methods.balanceOf(walletAddress).call();
        const formattedBalance = (Number(balance) / Math.pow(10, 18)).toFixed(4);
        res.json({ balance: formattedBalance });
    } catch (error) {
        console.error('Error fetching SHT token balance on Polygon chain:', error);
        res.status(500).json({ error: 'Failed to fetch SHT balance on Polygon chain' });
    }
});

// Route to check LP position ownership and details
router.get('/get-lp-ownership', async (req, res) => {
    const { walletAddress, tickLower, tickUpper } = req.query;
    console.log("Wallet Address:", walletAddress);
    try {
        const positionKey = generatePositionKey(walletAddress, parseInt(tickLower), parseInt(tickUpper));
        const position = await lpTokenContract.methods.positions(positionKey).call();

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

// swap endpoint for POL/SHT LP contract
router.post('/swap', async (req, res) => {
    const { recipient, zeroToOne, amountRequired, slippage, extraData } = req.body;

    const privateKey = process.env.PRIVATE_KEY;

    // Check current allowance before proceeding
    const allowance = await shtContract.methods.allowance(recipient, LP_TOKEN_CONTRACT_ADDRESS).call();
    console.log("Current Allowance:", allowance);

    if (BigInt(allowance) < BigInt(amountRequired)) {
        return res.status(400).json({ error: 'Insufficient allowance for SHT token' });
    }

    console.log("Recipient:", recipient);
    console.log("Zero to One:", zeroToOne);
    console.log("Amount Required:", amountRequired);
    console.log("Slippage:", slippage);
    console.log("Extra Data:", extraData);

    // Fetch token0 and token1 from LP contract
    const token0 = await lpTokenContract.methods.token0().call();
    const token1 = await lpTokenContract.methods.token1().call();
    console.log("Token0:", token0);
    console.log("Token1:", token1);

    const currentSqrtPriceX96 = await lpTokenContract.methods.globalState().call();
    const slippageTolerance = BigInt(slippage * Number(currentSqrtPriceX96[0]));
    const limitSqrtPriceWithSlippage = currentSqrtPriceX96[0] + slippageTolerance;

    console.log("Current sqrtPriceX96:", currentSqrtPriceX96[0]);
    console.log("Limit Sqrt Price with Slippage:", limitSqrtPriceWithSlippage);
    // convert limitSqrtPriceWithSlippage to uint160
    const limitSqrtPriceWithSlippageUint160 = new BN(limitSqrtPriceWithSlippage).toString();    try {
        // Approve the LP contract to spend `amountRequired` on behalf of the user
        // const approveTx = shtContract.methods.approve(LP_TOKEN_CONTRACT_ADDRESS, amountRequired);
        // const encodedApprovalABI = approveTx.encodeABI();

        // const approvalTxObject = {
        //     from: recipient,
        //     to: SHT_TOKEN_CONTRACT_ADDRESS,
        //     data: encodedApprovalABI,
        //     gasLimit: web3Polygon.utils.toHex(100000),
        //     gasPrice: await web3Polygon.eth.getGasPrice(),
        // };

        // const signedApprovalTx = await web3Polygon.eth.accounts.signTransaction(approvalTxObject, privateKey);
        // const approvalReceipt = await web3Polygon.eth.sendSignedTransaction(signedApprovalTx.rawTransaction);

        // console.log('Approval transaction hash:', approvalReceipt.transactionHash);

        // Prepare the swap transaction data
        const txData = lpTokenContract.methods.swap(
            recipient,
            zeroToOne,
            amountRequired,
            limitSqrtPriceWithSlippageUint160,
            extraData
        );
        console.log("Tx Data:", txData);
        // Encode the transaction data for swap
        const encodedABI = txData.encodeABI();

        // Get transaction count for nonce
        const nonce = await web3Polygon.eth.getTransactionCount(recipient);
        console.log("Nonce:", nonce);
        const gasPrice = await web3Polygon.eth.getGasPrice();
        console.log("Gas Price:", gasPrice);
        // estimate gas
        // const gas = await txData.estimateGas({ from: recipient });
        // console.log("Gas:", gas);

        // Define swap transaction object
        // const txObject = {
        //     from: recipient,
        //     nonce: web3Polygon.utils.toHex(nonce),
        //     to: LP_TOKEN_CONTRACT_ADDRESS,
        //     data: encodedABI,
        //     gasLimit: web3Polygon.utils.toHex(1000000),
        //     gasPrice: web3Polygon.utils.toHex(gasPrice),
        // };

        // // Sign the swap transaction
        // const signedTx = await web3Polygon.eth.accounts.signTransaction(txObject, privateKey);

        // // Send the signed swap transaction
        // const tx = await web3Polygon.eth.sendSignedTransaction(signedTx.rawTransaction);

        // console.log('Swap transaction sent:', tx.transactionHash);
        // res.json({ success: true, transactionHash: tx.transactionHash });
    } catch (error) {
        console.error('Error during swap transaction:', error);
        // decode data bytes to get error message in human readable format
        const decodedError = web3Polygon.eth.abi.decodeParameter('string', error.data);
        console.log("Decoded Error:", decodedError);
        res.status(500).json({ error: 'Failed to execute swap' });
    }
});

// Route to collect fees
router.post('/collect-fees', async (req, res) => {
    const { recipient, bottomTick, topTick, amount0Requested, amount1Requested } = req.body;

    try {
        const tx = await lpTokenContract.methods.collect(
            recipient,
            bottomTick,
            topTick,
            web3Polygon.utils.toHex(amount0Requested),
            web3Polygon.utils.toHex(amount1Requested)
        ).send({ from: recipient });

        console.log('Collect fees transaction sent:', tx.transactionHash);
        res.json({ success: true, transactionHash: tx.transactionHash });
    } catch (error) {
        console.error('Error during fee collection transaction:', error);
        res.status(500).json({ error: 'Failed to collect fees' });
    }
});

// Route to transfer POL to MintMe wallet
router.post('/send-pol-to-mintme', async (req, res) => {
    const { fromAddress, recipientAddress, amountToSend } = req.body;
    const privateKey = process.env.PRIVATE_KEY; // Replace with a private key or a secure signing method.

    try {
        const sendAmount = web3Polygon.utils.toWei(amountToSend.toString(), 'ether');
        const transaction = {
            from: fromAddress,
            to: recipientAddress,
            value: sendAmount,
            gas: 21000,
            gasPrice: await web3Polygon.eth.getGasPrice(),
        };

        // Sign and send the transaction
        const signedTx = await web3Polygon.eth.accounts.signTransaction(transaction, privateKey);
        const receipt = await web3Polygon.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('Transaction hash:', receipt.transactionHash);
        res.json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error sending POL:', error);
        res.status(500).json({ error: 'Failed to send POL to MintMe wallet' });
    }
});

module.exports = router;

// Make sure to have a helper function to generate position keys (if not already implemented)
function generatePositionKey(walletAddress, tickLower, tickUpper) {
    // Generate a position key based on wallet address and ticks
    return web3Polygon.utils.soliditySha3(walletAddress, tickLower, tickUpper);
}
