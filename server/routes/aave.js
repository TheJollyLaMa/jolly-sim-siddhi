const express = require('express');
const Web3 = require('web3').Web3;
const router = express.Router();
require('dotenv').config();
const aave = require("@aave/protocol-js");
// console.log('aave:', aave);


// // Define Protocol Data Provider address for the network you’re using
// const protocolDataProviderAddress = "0x65285E9dfab318f57051ab2b139ccCf232945451"; // Mainnet
// // You can replace with Polygon or other network addresses

// // Minimal ABI for Aave Protocol Data Provider contract
// const protocolDataProviderABI = [
//   {
//     constant: true,
//     inputs: [{ internalType: "address", name: "user", type: "address" }],
//     name: "getUserReserveData",
//     outputs: [
//       { internalType: "uint256", name: "currentATokenBalance", type: "uint256" },
//       { internalType: "uint256", name: "currentVariableDebt", type: "uint256" },
//       { internalType: "uint256", name: "principalStableDebt", type: "uint256" },
//       // Add additional outputs as needed
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ];


// // Initialize Web3
// const web3Polygon = new Web3(process.env.POLYGON_RPC_URL);

// // Initialize Protocol Data Provider Contract
// const protocolDataProvider = new Web3.eth.Contract(protocolDataProviderABI, protocolDataProviderAddress);

// // Function to get user reserves data
// async function getUserReserves(userAddress) {
//   try {
//     // Fetch data from Aave Protocol Data Provider
//     const reserveData = await protocolDataProvider.methods.getUserReserveData(userAddress).call();
//     return {
//       supplied: web3.utils.fromWei(reserveData.currentATokenBalance),
//       borrowed: web3.utils.fromWei(reserveData.currentVariableDebt),
//     };
//   } catch (error) {
//     console.error("Error fetching user reserves:", error);
//     throw error;
//   }
// }

// // Define the /aave route
// router.get("/aave", async (req, res) => {
//   const userAddress = req.query.address;
//   if (!userAddress) {
//     return res.status(400).send("User address is required.");
//   }

//   try {
//     const balances = await getUserReserves(userAddress);
//     res.status(200).json(balances);
//   } catch (error) {
//     res.status(500).send("Error fetching user reserves.");
//   }
// });

module.exports = router;