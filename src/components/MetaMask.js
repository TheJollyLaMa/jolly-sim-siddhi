import React, { useState, useEffect, useRef } from 'react';
import '../styles/MetaMask.css'; // Updated path

const MetaMask = ({ setWalletAddress, setNetworkName }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const networkIconRef = useRef(null); // Create a ref for the network icon
  const networkDropdownRef = useRef(null); // Create a ref for the network dropdown
  const buttonTextRef = useRef(null); // Create a ref for the button text
  const networkDetails = {
    "0x1": { name: "Ethereum Mainnet", icon: "https://bafybeiarqdmwbrhb2ncgzd25zyyl6zzh6wyjqmnfunkdluafhoqusflnte.ipfs.w3s.link/EthLogo.gif" },
    "0x89": { name: "Polygon", icon: "https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" },
    "0x609e": { name: "MintMe", icon: "https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png" }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      connectMetaMask();

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSelectedAccount(accounts[0]);
        updateUI(accounts[0], window.ethereum.chainId);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setSelectedAccount(null);
        updateUI(null, window.ethereum.chainId);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to use this feature.');
      setSelectedAccount(null);
      updateUI(null, window.ethereum.chainId);
    }
  };

  const handleAccountsChanged = (accounts) => {
    setSelectedAccount(accounts.length > 0 ? accounts[0] : null);
    updateUI(accounts.length > 0 ? accounts[0] : null, window.ethereum.chainId);
  };

  const handleChainChanged = (chainId) => {
    updateNetworkIcon(chainId);
    updateUI(selectedAccount, chainId);
  };

  const updateUI = (account, chainId) => {
    if (account) {
      setWalletAddress(account);
      setNetworkName(networkDetails[chainId]?.name || 'Unknown');
      updateNetworkIcon(chainId);
      networkDropdownRef.current.value = chainId; // Set dropdown value to the current network
      networkDropdownRef.current.style.display = 'inline-block'; // Show dropdown when connected
      buttonTextRef.current.style.display = 'none'; // Hide button text when connected
      networkIconRef.current.style.display = 'inline'; // Ensure network icon is displayed
    } else {
      setWalletAddress('No wallet connected');
      setNetworkName('Connect Wallet');
      networkIconRef.current.style.display = 'none';
      networkDropdownRef.current.style.display = 'none'; // Hide dropdown when not connected
      buttonTextRef.current.style.display = 'inline'; // Show button text when not connected
    }
  };

  const changeNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }]
      });
      updateNetworkIcon(chainId); // Update the network icon immediately after switching
    } catch (error) {
      console.error('Failed to switch the network:', error);
      alert(`Failed to switch the network: ${error.message}`);
    }
  };

  const formatAddress = (address) => {
    const start = address.slice(0, 4);
    const end = address.slice(-4);
    const img = `<img src="https://bafybeifej4defs5s5wryxylmps42c7xkbzle3fxjgnsbb5hcfnd5b77zwa.ipfs.w3s.link/Ens_Eth_Breathe.gif" alt="x" style="width: 16px; height: 16px; vertical-align: middle;">`.repeat(4);
    return (
      <span dangerouslySetInnerHTML={{ __html: `${start}${img}${end}` }} />
    );
  };

  const updateNetworkIcon = (chainId) => {
    const details = networkDetails[chainId];
    if (details && selectedAccount) {
      networkIconRef.current.src = details.icon;
      networkIconRef.current.style.display = 'inline';
    } else {
      networkIconRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    if (selectedAccount && window.ethereum.chainId) {
      updateNetworkIcon(window.ethereum.chainId);
    }
  }, [selectedAccount]);

  return (
    <button id="metamaskButton" onClick={connectMetaMask}>
      <img src="/assets/MetaMaskFox.png" alt="Fox Icon" />
      <span ref={buttonTextRef} id="buttonText">Connect Wallet</span>
      <select id="networkDropdown" ref={networkDropdownRef} onChange={(e) => changeNetwork(e.target.value)} style={{ display: 'none' }}>
        <option value="0x1">Ethereum Mainnet</option>
        <option value="0x89">Polygon</option>
        <option value="0x609e">MintMe</option>
      </select>
      <img ref={networkIconRef} id="networkIcon" src="" alt="Network Icon" style={{ display: 'none' }} />
    </button>
  );
};

export default MetaMask;