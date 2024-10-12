import React, { useEffect } from 'react';

const Balances = ({ walletAddress, setMintMeBalance, setDshBalance, setPolBalance, setEthBalance, mintMeBalance, dshBalance, polBalance, ethBalance }) => {

  const fetchBalances = async (address) => {
    try {
      const mintMeResponse = await fetch(`/api/get-mintme-balance?walletAddress=${address}`);
      const mintMeData = await mintMeResponse.json();
      setMintMeBalance(mintMeData.balance);

      const dshResponse = await fetch(`/api/get-dsh-balance?walletAddress=${address}`);
      const dshData = await dshResponse.json();
      setDshBalance(dshData.balance);

      const polResponse = await fetch(`/api/get-pol-balance?walletAddress=${address}`);
      const polData = await polResponse.json();
      setPolBalance(polData.balance);

      const ethResponse = await fetch(`/api/get-eth-balance?walletAddress=${address}`);
      const ethData = await ethResponse.json();
      setEthBalance(ethData.balance);

    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress]);

  const formatBalance = (balance) => {
    // Convert balance to a number, fallback to 0 if balance is invalid or not a number
    return balance ? Number(balance).toFixed(4) : '0.0000';
  };

  return (
    <div className="token-balances">
      {/* ETH Balance */}
      <div className="token-balance">
        <img src="https://bafybeifej4defs5s5wryxylmps42c7xkbzle3fxjgnsbb5hcfnd5b77zwa.ipfs.w3s.link/Ens_Eth_Breathe.gif" alt="Sim Siddhi Defi" className="token-icon" />
        <p>ETH: {formatBalance(ethBalance)}</p>
      </div>

      {/* Polygon Balance */}
      <div className="token-balance">
        <img src="https://bafybeic5bvnkjejuxbogn2n7lyzfyf5l6glgzrxkidjwj4yvhyci5haoca.ipfs.w3s.link/PolygonLogo.png" alt="Sim Siddhi Defi" className="token-icon" />
        <p>Polygon: {formatBalance(polBalance)}</p>
      </div>

      {/* MintMe Balance */}
      <div className="token-balance">
        <img src="https://bafybeig67sj4te7xkz5ku67ksnhxdfzikblc77gsecv53owxe6b4z5aega.ipfs.w3s.link/MintMeLogo.png" alt="MintMe" className="token-icon" />
        <p>MintMe: {formatBalance(mintMeBalance)}</p>
      </div>

      {/* DSH Balance */}
      <div className="token-balance">
        <img src="https://bafybeigr6ri2ythjbciusgjdvimjt74caymflc5ut4rmtrkhcoi2cr53ua.ipfs.w3s.link/DecentSmartHome.png" alt="Decent Smart Home Token" className="token-icon" />
        <p>DSH: {formatBalance(dshBalance)}</p>
      </div>
    </div>
  );
};

export default Balances;