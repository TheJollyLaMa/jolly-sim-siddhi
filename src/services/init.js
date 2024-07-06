import * as THREE from 'three';
import Web3 from 'web3';
import io from 'socket.io-client';

export const initThreeJS = () => {
  // Initialize Three.js scene
};

export const initWeb3 = (setWalletAddress, setNetworkName) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          setWalletAddress(accounts[0]);
          return web3.eth.net.getNetworkType();
        })
        .then(network => {
          setNetworkName(network.charAt(0).toUpperCase() + network.slice(1));
        })
        .catch(error => {
          console.error("Error connecting to MetaMask", error);
        });
  
      window.ethereum.on('accountsChanged', accounts => {
        setWalletAddress(accounts[0]);
      });
  
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } else {
      console.error("MetaMask is not installed.");
    }
  };
  

export const initSocket = () => {
  // Initialize Socket.io connection
};

