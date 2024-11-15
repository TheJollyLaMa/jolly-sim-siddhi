import React, { useEffect, useState } from 'react';
import '../styles/BalanceDropdownStyles.css';

// The network details with icons
const networkDetails = {
  "Ethereum Mainnet": {
    coinIcon: "https://bafybeiarqdmwbrhb2ncgzd25zyyl6zzh6wyjqmnfunkdluafhoqusflnte.ipfs.w3s.link/EthLogo.gif",
  },
  "Polygon": {
    coinIcon: "https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png",
  },
  "MintMe": {
    coinIcon: "https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png",
  },
  "DSH Token": "https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png"
};

const Balances = ({
  walletAddress,
  setMintMeBalance,
  setShtBalance,
  setDshBalance,
  setPolBalance,
  setEthBalance,
  mintMeBalance,
  shtBalance,
  dshBalance,
  polBalance,
  ethBalance,
  networkName
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const fetchBalances = async (address) => {
    try {
      const mintMeResponse = await fetch(`/api/get-mintme-balance?walletAddress=${address}`);
      const mintMeData = await mintMeResponse.json();
      console.log(mintMeData.balance);
      setMintMeBalance(mintMeData.balance);

      const shtResponse = await fetch(`/api/get-sht-balance?walletAddress=${address}`);
      const shtData = await shtResponse.json();
      setShtBalance(shtData.balance);

      const dshResponse = await fetch(`/api/get-dsh-balance?walletAddress=${address}`);
      const dshData = await dshResponse.json();
      setDshBalance(dshData.balance);

      const polResponse = await fetch(`/api/get-pol-balance?walletAddress=${address}`);
      const polData = await polResponse.json();
      console.log(polData.balance);
      setPolBalance(polData.balance);

      const ethResponse = await fetch(`/api/get-eth-balance?walletAddress=${address}`);
      const ethData = await ethResponse.json();
      setEthBalance(ethData.balance);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchSwapPrices = async (address) => {
    // Fetch swap prices from LP_Arbitrage python script
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress]);


  const formatBalance = (balance) => (balance ? Number(balance).toFixed(4) : '0.0000');

  // Determine main coin and token icons and balances based on networkName
  /* CHANGED: Adjusted mainCoinIcon and mainCoinBalance to depend on networkName */
  const mainCoinIcon = networkDetails[networkName]?.coinIcon || networkDetails["MintMe"].coinIcon;  // Default to MintMe if undefined
  const mainCoinBalance = 
    networkName === "Ethereum Mainnet" ? ethBalance :
    networkName === "Polygon" ? polBalance : mintMeBalance;
  const mainTokenIcon = networkDetails["DSH Token"];
  const mainTokenBalance = networkName === "Polygon" ? shtBalance : dshBalance;

  return (
    <div className="balance-dropdowns">
      {/* Coin Dropdown */}
      <div className="dropdown" onClick={() => toggleDropdown('coin')}>
        <div className="dropdown-display">
          {mainCoinIcon && <img src={mainCoinIcon} alt="Main Coin" className="token-icon" />}
          <span className="shimmer-green">{formatBalance(mainCoinBalance)}</span>
        </div>
        {openDropdown === 'coin' && (
          <div className="dropdown-content">
            {networkName !== "Ethereum Mainnet" && (
              <div className="dropdown-item">
                <img src={networkDetails["Ethereum Mainnet"].coinIcon} alt="ETH" className="icon" />
                <p>ETH: <span className="shimmer-green">{formatBalance(ethBalance)}</span></p>
              </div>
            )}
            {networkName !== "Polygon" && (
              <div className="dropdown-item">
                <img src={networkDetails["Polygon"].coinIcon} alt="Polygon" className="icon" />
                <p>Polygon: <span className="shimmer-green">{formatBalance(polBalance)}</span></p>
              </div>
            )}
            {networkName !== "MintMe" && (
              <div className="dropdown-item">
                <img src={networkDetails["MintMe"].coinIcon} alt="MintMe" className="icon" />
                <p>MintMe: <span className="shimmer-green">{formatBalance(mintMeBalance)}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Dropdown */}
      <div className="dropdown" onClick={() => toggleDropdown('token')}>
        <div className="dropdown-display">
          <img src={mainTokenIcon} alt="DSH Token" className="token-icon" />
          <span className="shimmer-green">{formatBalance(mainTokenBalance)}</span>
        </div>
        {openDropdown === 'token' && (
          <div className="dropdown-content">
            {networkName !== "Polygon" && (
              <div className="dropdown-item">
                <img src={mainTokenIcon} alt="SHT" className="icon" />
                <p>SHT: <span className="shimmer-green">{formatBalance(shtBalance)}</span></p>
              </div>
            )}
            {networkName !== "MintMe" && (
              <div className="dropdown-item">
                <img src={mainTokenIcon} alt="DSH" className="icon" />
                <p>DSH: <span className="shimmer-green">{formatBalance(dshBalance)}</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Balances;